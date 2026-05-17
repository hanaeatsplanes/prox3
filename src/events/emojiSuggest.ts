import { getEmojiList } from "@/utils/slack/middleware.ts";

export default async function (query: string) {
	const emojiList = await getEmojiList();
	const q = query.toLowerCase().trim();
	const options = emojiList.filter(({ value }) => value.toLowerCase().startsWith(q)).slice(0, 25);
	return { options };
}
