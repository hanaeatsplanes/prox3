import { type Context, Elysia } from "elysia";
import { errorMessage } from "@/config/language/index.ts";
import blockActionHandler from "@/core/events/handlers/blockActionHandler.ts";
import commandHandler from "@/core/events/handlers/commandHandler.ts";
import dmHandler from "@/core/events/handlers/dmHandler.ts";
import messageActionHandler from "@/core/events/handlers/messageActionHandler.ts";
import viewClosedHandler from "@/core/events/handlers/viewClosedHandler.ts";
import viewSubmissionHandler from "@/core/events/handlers/viewSubmissionHandler.ts";
import type {
	BlockActionEvent,
	MessageActionEvent,
	MessageIMEvent,
	SlackURLVerification,
	ViewClosedEvent,
	ViewSubmissionEvent,
} from "@/models/event.ts";
import { chatPostEphemeral } from "@/utils/slack/client.ts";
import { extractEvent, verifySlackRequest } from "@/utils/slack/middleware.ts";

async function handler({ request, set }: Context) {
	try {
		const contentType = request.headers.get("content-type");
		const rawBody = await request.text();
		if (!contentType || !rawBody) {
			console.error("[events] missing body or content-type");
			set.status = 503;
			return;
		}

		if (!(await verifySlackRequest(request, rawBody))) {
			console.error("[events] failed slack request verification");
			set.status = 503;
			return;
		}

		const body = extractEvent(rawBody, contentType);
		switch (body.type) {
			case "url_verification": {
				return (body as SlackURLVerification).challenge;
			}
			default: {
				void handleValidatedEvent(body).catch((error) => onFail(body, error));
				return "";
			}
		}
	} catch (error) {
		console.error("[events] unhandled error:", error);
		set.status = 503;
	}
}

function onFail(
	body:
		| MessageIMEvent
		| BlockActionEvent
		| ViewSubmissionEvent
		| ViewClosedEvent,
	error: Error
) {
	const rayId = Math.random().toString(36).slice(2, 10);
	console.error(`${rayId}: event failed:`, error);

	if (body.type === "view_submission" || body.type === "view_closed") {
		console.error(`[failure]: Ray ID ${rayId} for view event`);
		return;
	}

	const isBlock = body.type === "block_actions";
	const channel = isBlock ? body.container.channel_id : body.event.channel;
	const user = isBlock ? body.user.id : body.event.user;
	void chatPostEphemeral(
		channel,
		user,
		errorMessage(rayId, error.message)
	).catch((error) =>
		console.error(`[failure]: Ray ID ${rayId} sending failed: `, error)
	);
}

async function handleValidatedEvent(
	body:
		| BlockActionEvent
		| MessageIMEvent
		| ViewSubmissionEvent
		| ViewClosedEvent
		| MessageActionEvent
) {
	switch (body.type) {
		case "event_callback": {
			const { event } = body;
			if (
				event.type !== "message" ||
				event.channel_type !== "im" ||
				event.subtype ||
				event.bot_id ||
				event.thread_ts
			) {
				return;
			}

			await dmHandler(event.channel, event.ts);
			return;
		}

		case "block_actions": {
			await blockActionHandler(body as BlockActionEvent);
			return;
		}

		case "view_submission": {
			await viewSubmissionHandler(body as ViewSubmissionEvent);
			return;
		}

		case "view_closed": {
			await viewClosedHandler(body as ViewClosedEvent);
			return;
		}

		case "message_action": {
			await messageActionHandler(body as MessageActionEvent);
			return;
		}

		default: {
			console.warn(
				`[events] unhandled event type: ${(body as { type: unknown }).type}`
			);
		}
	}
}

export default new Elysia().use(commandHandler).post("/api/events", handler);
