import { redis } from "bun";

export async function hasStaged(ts: string): Promise<boolean> {
  return !!(await redis.get(`dm-ts:${ts}`));
}
export async function setStaged(ts: string): Promise<unknown> {
  return await redis.setex(`dm-ts:${ts}`, 20, "1");
}
