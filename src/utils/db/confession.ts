import { redis, sql } from "bun";
import { Confession } from "@/models/confession.ts";

export async function nextId(): Promise<number> {
  return await redis.incr("id");
}

export async function getConfession(
  id: string
): Promise<Confession | undefined> {
  // check redis
  const redisRes = await redis.get(`confession:${id}`);
  if (redisRes) {
    redis.expire(`confession:${id}`, 60 * 10).catch(console.error);
    const confessionBody = JSON.parse(redisRes);
    return Confession.from(confessionBody);
  }
  const confessionBody = await sql`
    SELECT * FROM confessions
    WHERE id = ${id};
  `;

  redis
    .setex(`confession:${id}`, 60 * 10, JSON.stringify(confessionBody))
    .catch(console.error);

  return Confession.from(confessionBody[0]);
}

export async function putConfession(confession: Confession): Promise<void> {
  redis.del(`confession:${confession.id}`);
}

export async function updateConfession(id): Promise<void> {}
