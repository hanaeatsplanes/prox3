import { redis } from "bun";

export async function getCachedEmojiList(): Promise<string[]> {
	const query = await redis.get("emojis");
	return query ? (JSON.parse(query) as string[]) : [];
}

export async function cacheEmojiList(list: string[]): Promise<void> {
	await redis.setex("emojis", 24 * 60 * 60, JSON.stringify(list, null, 0));
}
