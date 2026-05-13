import { Elysia } from "elysia";
import { errorMessage } from "@/config/language.ts";
import commandHandler from "@/events/commandHandler.ts";
import eventHandler from "@/events/eventHandler.ts";
import { CommandBody, SlackEventBody, type SlackInboundRequest } from "@/models/event.ts";
import { chatPostEphemeral, chatPostMessage } from "@/utils/slack/client.ts";
import { extractEvent, verifySlackRequest } from "@/utils/slack/middleware.ts";

function onFail(body: SlackInboundRequest, error: Error) {
	const rayId = Math.random().toString(36).slice(2, 10);
	const type = "type" in body ? body.type : "command";
	const message = error.message;
	console.error(`[events] [${rayId}] ${type} failed: ${message}`);
	console.error(`[events] [${rayId}] stack:`, error.stack);

	if ("command" in body) {
		void chatPostEphemeral(body.channel_id, body.user_id, errorMessage(rayId, message)).catch((err) =>
			console.error(`[${rayId}] ephemeral failed:`, err)
		);
		return;
	}

	switch (body.type) {
		case "event_callback": {
			if (body.event.type === "message") {
				void chatPostEphemeral(body.event.channel, body.event.user, errorMessage(rayId, message)).catch(
					(err) => console.error(`[${rayId}] ephemeral failed:`, err)
				);
			}
			return;
		}
		case "block_actions": {
			const channel = body.container.channel_id || body.channel?.id;
			if (!channel) {
				console.error(`[events] [${rayId}] block action missing channel`);
				return;
			}
			void chatPostEphemeral(channel, body.user.id, errorMessage(rayId, message)).catch((err) =>
				console.error(`[${rayId}] ephemeral failed:`, err)
			);
			return;
		}
		case "message_action": {
			void chatPostEphemeral(body.channel.id, body.user.id, errorMessage(rayId, message)).catch(
				(err) => console.error(`[${rayId}] ephemeral failed:`, err)
			);
			return;
		}
		case "view_closed":
		case "view_submission": {
			void chatPostMessage(body.user.id, errorMessage(rayId, message)).catch((err) =>
				console.error(`[${rayId}] ephemeral failed:`, err)
			);
			return;
		}
		default: {
			return;
		}
	}
}

export default new Elysia({
	prefix: "/slack",
})
	.parser("slack-event", async ({ request, contentType }) => {
		const rawBody = await request.clone().text();
		return extractEvent(rawBody, contentType);
	})
	.derive(async ({ request, headers }) => {
		const rawBody = await request.text();
		const timestamp = headers["x-slack-request-timestamp"];
		const slackSignature = headers["x-slack-signature"];
		if (!timestamp || !slackSignature) {
			return {
				verified: false,
			};
		}
		return {
			verified: await verifySlackRequest(timestamp, slackSignature, rawBody),
		};
	})
	.onBeforeHandle(({ verified, status }) => {
		if (!verified) {
			return status(401, { error: "not signed", status: "error" });
		}
	})
	.onError(({ body, error }) => {
		return onFail(body as SlackInboundRequest, error as Error);
	})
	.post(
		"/events",
		({ body }) => {
			return eventHandler(body);
		},
		{
			body: SlackEventBody,
		}
	)
	.post(
		"/command",
		({ body }) => {
			return commandHandler(body);
		},
		{
			body: CommandBody,
		}
	);
