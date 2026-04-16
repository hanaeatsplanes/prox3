import { type Context, Elysia } from "elysia";
import blockActionHandler from "@/core/events/blockActionHandler.ts";
import commandHandler from "@/core/events/commandHandler.ts";
import dmHandler from "@/core/events/dmHandler.ts";
import type {
	BlockActionEvent,
	MessageIMEvent,
	SlackURLVerification,
} from "@/models/event.ts";
import { extractEvent, verifySlackRequest } from "@/utils/slack/middleware";

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
		if (body.type === "url_verification") {
			return (body as SlackURLVerification).challenge;
		}

		void handleValidatedEvent(body).catch((error) => {
			const rayId = Math.random().toString(36).slice(2, 10);
			console.error(`${rayId}: event failed:`, { cause: error });
			const isBlock = body.type === "block_actions";
			const channel = isBlock ? body.container.channel_id : body.event.channel;
			const user = isBlock ? body.user.id : body.event.user;
			void chatPostEphemeral(
				channel,
				user,
				`Something went wrong :( Please give @hna this Ray ID: **${rayId}**.`
			);
		});
	} catch (error) {
		console.error("[events] unhandled error:", error);
		set.status = 503;
	}
}

async function handleValidatedEvent(body: BlockActionEvent | MessageIMEvent) {
	if (body.type === "event_callback") {
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

		await dmHandler(event.text, event.channel, event.ts);
		return;
	}

	void blockActionHandler(body).catch((err) =>
		console.error("[button] handler failed:", err)
	);
}

export default new Elysia().use(commandHandler).post("/api/events", handler);
