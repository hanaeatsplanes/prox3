import { redis } from "bun";

export async function hasStaged(ts: string) {
  return !!(await redis.get(`dm-ts:${ts}`));
}
export async function setStaged(ts: string) {
  return await redis.setex(`dm-ts:${ts}`, 10, "1");
}
