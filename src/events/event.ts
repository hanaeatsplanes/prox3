import blockActionHandler from "@/events/blockAction.ts";
import dmHandler from "@/events/dm.ts";
import messageActionHandler from "@/events/messageAction.ts";
import viewClosedHandler from "@/events/viewClosed.ts";
import viewSubmissionHandler from "@/events/viewSubmission.ts";
import type {
	BlockActionEvent,
	MessageActionEvent,
	SlackEventBody,
	ViewClosedEvent,
	ViewSubmissionEvent,
} from "@/models/event.ts";

export default async function handleValidatedEvent(body: SlackEventBody) {
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
			console.warn(`[events] unhandled event type: ${(body as { type: unknown }).type}`);
		}
	}
}
