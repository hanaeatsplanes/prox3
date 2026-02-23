export async function validateSlackRequest(
	request: Request
): Promise<string | false> {
	const timestamp = request.headers.get("X-Slack-Request-Timestamp");
	const slackSignature = request.headers.get("X-Slack-Signature");

	if (!timestamp || !slackSignature) return false;

	if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

	const body = await request.text();
	const baseString = `v0:${timestamp}:${body}`;

	const hasher = new Bun.CryptoHasher(
		"sha256",
		process.env.SLACK_SIGNING_SECRET
	);

	hasher.update(baseString);

	const signature = `v0=${hasher.digest("hex")}`;
	const valid = crypto.timingSafeEqual(
		Buffer.from(slackSignature),
		Buffer.from(signature)
	);
	return valid ? body : false;
}

export async function postMessage(
	channel: string,
	content: string | object[],
	thread?: {
		thread_ts: string;
		reply_broadcast?: true;
	}
) {
	const isText = typeof content === "string";
	const response = await fetch("https://slack.com/api/chat.postMessage", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			channel,
			...(isText ? { text: content } : { blocks: content }),
			...thread,
		}),
	});

	if (response.status === 429) {
		const retryAfter = response.headers.get("Retry-After");
		throw new Error(
			`Slack rate limited. Retry after ${retryAfter || "60"} seconds`
		);
	}

	if (!response.ok) throw new Error(`Slack API error: ${response.status}`);

	const data = (await response.json()) as { ok: boolean; error?: string };
	if (!data.ok) throw new Error(`Slack API: ${data.error}`);
}

export const confessionChannel = {
	meta: process.env.META,
	confessions: process.env.CONFESSIONS,
} as const;

export type ConfessionChannel =
	(typeof confessionChannel)[keyof typeof confessionChannel];

export class Confession {
	id: number;
	channel?: ConfessionChannel;
	state: "approved" | "rejected" | "staged" = "staged";

	constructor(id: number, channel?: ConfessionChannel) {
		this.id = id;
		if (channel) this.channel = channel;
	}
}
