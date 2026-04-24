import { redis } from "bun";

export async function isCached(ts: string) {
	return !!(await redis.get(`cache:${ts}`));
}

export async function cache(ts: string) {
	return redis.setex(`cache:${ts}`, 300, "1");
}

export async function clearCache(ts: string) {
	return redis.del(`cache:${ts}`);
}

export async function isUndoCached(ts: string) {
	return !!(await redis.get(`undo-cache:${ts}`));
}

export async function undoCache(ts: string) {
	return redis.setex(`undo-cache:${ts}`, 300, "1");
}
