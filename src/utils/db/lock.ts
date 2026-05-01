import { redis } from "bun";

export async function isLocked(ts: string): Promise<boolean> {
	const result = await redis.send("SET", [
		`cache:${ts}`,
		"1",
		"NX",
		"EX",
		"300",
	]);
	return result !== "OK";
}

export async function isUndoLocked(ts: string): Promise<boolean> {
	const result = await redis.send("SET", [
		`undo-lock:${ts}`,
		"1",
		"NX",
		"EX",
		"300",
	]);
	return result !== "OK";
}

export async function clearLock(ts: string) {
	return redis.del(`lock:${ts}`);
}

export async function clearUndoLock(ts: string) {
	return redis.del(`undo-lock:${ts}`);
}
