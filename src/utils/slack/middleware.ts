import { CryptoHasher } from "bun";
import type { ConfessionChannel } from "@/models/channels.ts";
import type {
	BlockActionEvent,
	CommandBody,
	EmojiSuggestPayload,
	MessageActionEvent,
	MessageIMEvent,
	SlackInboundRequest,
	SlackURLVerification,
	ViewClosedEvent,
	ViewSubmissionEvent,
} from "@/models/event.ts";
import { cacheEmojiList, getCachedEmojiList } from "@/utils/db/emoji.ts";
import {
	conversationsReplies,
	emojiList,
	reactionsAdd,
	reactionsRemove,
} from "@/utils/slack/client.ts";

export async function verifySlackRequest(
	timestamp: string,
	slackSignature: string,
	rawBody: string
) {
	if (!timestamp || !slackSignature || !process.env.SLACK_SIGNING_SECRET) {
		console.error("[middleware] missing timestamp or signature headers");
		return false;
	}

	const parsedTimestamp = Number.parseInt(timestamp, 10);
	if (Number.isNaN(parsedTimestamp)) {
		console.error("[middleware] invalid slack timestamp header");
		return false;
	}

	if (Math.abs(Date.now() / 1000 - parsedTimestamp) > 300) {
		console.error("[middleware] request timestamp too old, rejecting");
		return false;
	}

	const baseString = `v0:${timestamp}:${rawBody}`;

	const hasher = new CryptoHasher("sha256", process.env.SLACK_SIGNING_SECRET);

	hasher.update(baseString);

	const signature = `v0=${hasher.digest("hex")}`;
	const actualSignature = Buffer.from(slackSignature);
	const expectedSignature = Buffer.from(signature);
	if (actualSignature.length !== expectedSignature.length) {
		return false;
	}

	return crypto.timingSafeEqual(actualSignature, expectedSignature);
}

export function extractEvent(
	rawBody: string,
	contentType: string,
	command?: boolean
): SlackInboundRequest {
	if (contentType?.includes("application/json")) {
		return JSON.parse(rawBody) as MessageIMEvent | SlackURLVerification;
	} else if (contentType?.includes("application/x-www-form-urlencoded")) {
		const params = new URLSearchParams(rawBody);
		const payload = params.get("payload");
		if (command || !payload) {
			return Object.fromEntries(params.entries()) as CommandBody;
		}
		return JSON.parse(payload) as
			| BlockActionEvent
			| ViewClosedEvent
			| ViewSubmissionEvent
			| MessageIMEvent
			| MessageActionEvent
			| EmojiSuggestPayload;
	}
	console.error(`[middleware] unsupported content-type: ${contentType}`);
	throw new Error("not able to parse");
}

export function sanitizeMessage(message: string) {
	return message
		.replaceAll(/<@[A-Z0-9]+(\|[^>]*)?>/gi, "@redacted") //person (<@U...> or <@W...>)
		.replaceAll(/<!subteam\^[A-Z0-9]+(\|[^>]*)?>/gi, "@redacted") //group
		.replaceAll(/<!(channel|here|everyone)(\|[^>]*)?>/gi, "@redacted") //broadcast
		.replaceAll(/@(channel|here|everyone)\b/gi, "@redacted"); //plain text broadcasts (auto-parsed)
}

export async function getMyMessagesInThread(channel: ConfessionChannel, threadTs: string) {
	let response = await conversationsReplies(channel, threadTs);
	if (!response.ok) {
		throw new Error(`getAllMyMessages failed: conversations.replies call failed: ${response.error}`);
	}
	const messages = response.messages;
	while (response.has_more) {
		const cursor = response.response_metadata?.next_cursor;
		response = await conversationsReplies(channel, threadTs, cursor);
		if (!response.ok) {
			throw new Error(`getAllMyMessages failed: conversations.replies call failed: ${response.error}`);
		}
		messages.push(...response.messages);
	}
	return messages.filter(({ bot_id }) => bot_id === process.env.SLACK_BOT_ID).map(({ ts }) => ts);
}

export async function toggleReaction(channel: string, name: string, timestamp: string) {
	try {
		await reactionsAdd(channel, name, timestamp);
	} catch (error) {
		if (error instanceof Error && error.message.includes("already_reacted")) {
			await reactionsRemove(channel, name, timestamp);
		} else {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(
				`[slack] failed to toggle reaction ${name} in ${channel} at ${timestamp}: ${message}`,
				{
					cause: error,
				}
			);
		}
	}
}

const stringToOption = (val: string) => {
	return {
		text: {
			text: `:${val}: ${val}`,
			type: "plain_text" as const,
		},
		value: val,
	};
};
export async function getEmojiList(): Promise<
	{
		text: {
			type: "plain_text";
			text: string;
		};
		value: string;
	}[]
> {
	const cache = await getCachedEmojiList();
	if (cache.length !== 0) {
		return cache.map(stringToOption);
	}
	const api = await emojiList();
	if (!api) return [];
	const names = Object.keys(api);
	await cacheEmojiList(names);
	return names.map(stringToOption);
}
