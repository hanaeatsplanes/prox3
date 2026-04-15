import { CryptoHasher } from "bun";
import type { ConfessionChannel } from "@/models/channels.ts";
import type {
	BlockActionEvent,
	CommandBody,
	MessageIMEvent,
	SlackURLVerification,
} from "@/models/event.ts";
import { conversationsReplies } from "@/utils/slack/client.ts";

export async function verifySlackRequest(request: Request, rawBody: string) {
	const timestamp = request.headers.get("X-Slack-Request-Timestamp");
	const slackSignature = request.headers.get("X-Slack-Signature");
	const signingSecret = process.env.SLACK_SIGNING_SECRET;

	if (!timestamp || !slackSignature || !signingSecret) {
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

	const hasher = new CryptoHasher("sha256", signingSecret);

	hasher.update(baseString);

	const signature = `v0=${hasher.digest("hex")}`;
	const actualSignature = Buffer.from(slackSignature);
	const expectedSignature = Buffer.from(signature);
	if (actualSignature.length !== expectedSignature.length) {
		return false;
	}

	return crypto.timingSafeEqual(actualSignature, expectedSignature);
}

export function extractEvent(rawBody: string, contentType: string) {
	if (contentType?.includes("application/json")) {
		return JSON.parse(rawBody) as MessageIMEvent | SlackURLVerification;
	} else if (contentType?.includes("application/x-www-form-urlencoded")) {
		const params = new URLSearchParams(rawBody);
		const payload = params.get("payload");
		if (!payload) {
			console.error("[middleware] no payload in form-urlencoded body");
			throw new Error("no payload in application/x-www-form-urlencoded");
		}
		return JSON.parse(payload) as BlockActionEvent;
	}
	console.error(`[middleware] unsupported content-type: ${contentType}`);
	throw new Error("not able to parse");
}

export function extractCommandBody(rawBody: string) {
	const params = new URLSearchParams(rawBody);
	return Object.fromEntries(params.entries()) as CommandBody;
}

export function sanitizeMessage(message: string) {
	return message
		.replaceAll(/<@[A-Z0-9]+(\|[^>]*)?>/gi, "@redacted") //person (<@U...> or <@W...>)
		.replaceAll(/<!subteam\^[A-Z0-9]+(\|[^>]*)?>/gi, "@redacted") //group
		.replaceAll(/<!(channel|here|everyone)(\|[^>]*)?>/gi, "@redacted") //broadcast
		.replaceAll(/@(channel|here|everyone)\b/gi, "@redacted"); //plain text broadcasts (auto-parsed)
}

export async function getAllMyMessages(
	channel: ConfessionChannel,
	threadTs: string
) {
	let response = await conversationsReplies(channel, threadTs);
	if (!response.ok) {
		throw new Error(
			`getAllMyMessages failed: conversations.replies call failed: ${response.error}`
		);
	}
	const messages = response.messages;
	while (response.has_more) {
		const cursor = response.response_metadata?.next_cursor;
		response = await conversationsReplies(channel, threadTs, cursor);
		if (!response.ok) {
			throw new Error(
				`getAllMyMessages failed: conversations.replies call failed: ${response.error}`
			);
		}
		messages.push(...response.messages);
	}
	return messages;
}
