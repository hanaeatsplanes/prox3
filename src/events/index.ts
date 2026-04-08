import { type Context, Elysia } from "elysia";
import buttonPressHandler from "@/events/buttonPressHandler.ts";
import dmConfessionHandler from "@/events/dmConfessionHandler.ts";
import type {
	BlockActionEvent,
	MessageIMEvent,
	SlackURLVerification,
} from "@/models/event.ts";
import { extractEvent, verifySlackRequest } from "@/utils/slack/middleware";

async function handler({ request }: Context) {
	try {
		const contentType = request.headers.get("content-type");
		const rawBody = await request.text();
		if (!contentType || !rawBody) {
			console.error("[events] missing body or content-type");
			return { error: "missing body or content-type", status: "error" };
		}

		if (!(await verifySlackRequest(request, rawBody))) {
			console.error("[events] failed slack request verification");
			return { error: "invalid signature", status: "error" };
		}

		const body = extractEvent(rawBody, contentType);

		const { type } = body;

		if (type === "url_verification") {
			console.log("[events] url verification challenge");
			return (body as SlackURLVerification).challenge;
		}

		if (type === "event_callback") {
			const { event } = body as MessageIMEvent;
			if (
				event.type === "message" &&
				event.channel_type === "im" &&
				!event.subtype &&
				!event.bot_id &&
				!event.thread_ts
			) {
				console.log(
					`[events] incoming DM confession from channel ${event.channel}`
				);
				dmConfessionHandler(event.text, event.channel, event.ts).catch((err) =>
					console.error("[events] dmConfessionHandler failed:", err)
				);
			}
		} else if (type === "block_actions") {
			console.log(
				`[events] block action received: ${(body as BlockActionEvent).actions[0]?.action_id}`
			);
			buttonPressHandler(body).catch((err) =>
				console.error("[events] buttonPressHandler failed:", err)
			);
		}
	} catch (error) {
		console.error("[events] unhandled error:", error);
		return { status: "error" };
	}
	return { status: "ok" };
}

export default new Elysia().post("/api/events", handler);
