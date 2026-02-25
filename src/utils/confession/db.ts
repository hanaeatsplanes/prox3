import { redis } from "bun";

export function nextId() {
  return 1; //todo: implement
}
export async function hasStaged(ts: string) {
  return !!(await redis.get(`dm-ts:${ts}`));
}
export async function setStaged(ts: string) {
  return await redis.setex(`dm-ts:${ts}`, 30, "1");
}
