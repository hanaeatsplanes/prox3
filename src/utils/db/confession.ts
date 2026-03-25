import { redis, sql } from "bun";
import { Confession } from "@/models/confession.ts";

export async function nextId(): Promise<number> {
  const id = await redis.incr("id");
  console.log(`[db] next confession id: ${id}`);
  return id;
}

export async function getConfession(id: string): Promise<Confession | null> {
  const redisRes = await redis.get(`confession:${id}`);
  if (redisRes) {
    console.log(`[db] cache hit for confession ${id}`);
    redis
      .expire(`confession:${id}`, 60 * 10)
      .catch((err) =>
        console.error(`[db] redis expire failed for confession ${id}:`, err)
      );
    return Confession.from(JSON.parse(redisRes));
  }

  console.log(`[db] cache miss for confession ${id}, querying postgres`);
  const confessionBody = await sql`
    SELECT * FROM confessions WHERE id = ${id}
  `;

  const confession = confessionBody?.[0];
  if (confession) {
    redis
      .setex(`confession:${id}`, 60 * 10, JSON.stringify(confession))
      .catch((err) =>
        console.error(`[db] redis setex failed for confession ${id}:`, err)
      );
  } else {
    console.log(`[db] confession ${id} not found`);
  }

  return confession ? Confession.from(confession) : null;
}

export async function putConfession(confession: Confession): Promise<void> {
  console.log(
    `[db] saving confession ${confession.id} (state: ${confession.state})`
  );
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
  console.log(`[db] confession ${confession.id} saved`);
}
