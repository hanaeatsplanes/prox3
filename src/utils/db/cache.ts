import { redis } from "bun";

export async function isCached(ts: string): Promise<boolean> {
	const result = await redis.send("SET", [
		`cache:${ts}`,
		"1",
		"NX",
		"EX",
		"300",
	]);
	return result !== "OK";
}

export async function isUndoCached(ts: string): Promise<boolean> {
	const result = await redis.send("SET", [
		`undo-cache:${ts}`,
		"1",
		"NX",
		"EX",
		"300",
	]);
	return result !== "OK";
}

export async function clearCache(ts: string) {
	return redis.del(`cache:${ts}`);
}

export async function clearUndoCache(ts: string) {
	return redis.del(`undo-cache:${ts}`);
}
