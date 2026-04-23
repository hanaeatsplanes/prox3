import { redis } from "bun";

export async function isCached(ts: string) {
	return !!(await redis.get(`cache:${ts}`));
}

export async function cache(ts: string) {
	return redis.setex(`cache:${ts}`, 300, "1");
}
