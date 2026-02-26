import { redis } from "bun";
import type { Confession } from "@/models/confession.ts";

export async function nextId(): Promise<number> {
  return await redis.incr("id");
}

export async function confessionFromDB(
  _id: string
): Promise<Confession | undefined> {
  // check redis
  const _redisRes = await redis.get();
}
