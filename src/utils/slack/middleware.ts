import { CryptoHasher } from "bun";
import type {
	BlockActionEvent,
	CommandBody,
	MessageIMEvent,
	SlackURLVerification,
} from "@/models/event.ts";

export async function verifySlackRequest(request: Request, rawBody: string) {
	const timestamp = request.headers.get("X-Slack-Request-Timestamp");
	const slackSignature = request.headers.get("X-Slack-Signature");

	if (!timestamp || !slackSignature) {
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
	return crypto.timingSafeEqual(
		Buffer.from(slackSignature),
		Buffer.from(signature)
	);
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
