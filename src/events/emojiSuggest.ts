import { Elysia } from "elysia";

const EmojiNames = [
	"+1",
	"-1",
	"100",
	"beer",
	"cat",
	"clap",
	"coffee",
	"cry",
	"dog",
	"eyes",
	"fire",
	"ghost",
	"heart",
	"heart_eyes",
	"joy",
	"laughing",
	"muscle",
	"pizza",
	"pray",
	"question",
	"rage",
	"raised_hands",
	"robot_face",
	"rocket",
	"skull",
	"smile",
	"sob",
	"sparkles",
	"sunglasses",
	"tada",
	"thinking_face",
	"thumbsdown",
	"thumbsup",
	"warning",
	"wave",
	"white_check_mark",
	"wink",
	"x",
];

export default new Elysia().post("/slack/emoji", ({ body }) => {
	const raw = (body as { payload?: string }).payload;
	let query = "";
	if (raw) {
		try {
			const parsed = JSON.parse(raw) as { value?: string };
			query = (parsed.value ?? "").toLowerCase().trim();
		} catch {
			console.error("[emoji] failed to parse payload");
		}
	}
	console.log(`[emoji] query=${query}`);

	const matches = (query ? EmojiNames.filter((name) => name.includes(query)) : EmojiNames).slice(
		0,
		25
	);

	return {
		options: matches.map((name) => ({
			text: { text: `:${name}: ${name}`, type: "plain_text" },
			value: name,
		})),
	};
});
