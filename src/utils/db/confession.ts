import { redis, sql } from "bun";
import { Confession } from "@/models/confession.ts";

export async function nextId(): Promise<number> {
  return await redis.incr("id");
}

export async function getConfession(id: string): Promise<Confession | null> {
  const redisRes = await redis.get(`confession:${id}`);
  if (redisRes) {
    redis.expire(`confession:${id}`, 60 * 10).catch(console.error);
    return Confession.from(JSON.parse(redisRes));
  }

  const confessionBody = await sql`
    SELECT * FROM confessions WHERE id = ${id}
  `;

  const confession = confessionBody?.[0];
  if (confession) {
    redis
      .setex(`confession:${id}`, 60 * 10, JSON.stringify(confession))
      .catch(console.error);
  }

  return confession ? Confession.from(confession) : null;
}

export async function putConfession(confession: Confession): Promise<void> {
  await Promise.all([
    sql`
        INSERT INTO confessions (id, hash, confession, staging_ts, state)
        VALUES (${confession.id}, ${confession.hash}, ${confession.confession}, ${confession.stagingTs},
                ${confession.state})
        ON CONFLICT (id) DO UPDATE SET
        hash = EXCLUDED.hash,
        confession = EXCLUDED.confession,
        staging_ts = EXCLUDED.staging_ts,
        state = EXCLUDED.state
    `,
    redis.setex(
      `confession:${confession.id}`,
      60 * 10,
      JSON.stringify(confession)
    ),
  ]);
}
