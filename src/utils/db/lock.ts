import { redis } from "bun";

export async function acquireLock(ts: string): Promise<boolean> {
	const result = await redis.send("SET", [`lock:${ts}`, "1", "NX", "EX", String(300)]);
	return result === "OK";
}

export async function releaseLock(ts: string) {
	return redis.del(`lock:${ts}`);
}
