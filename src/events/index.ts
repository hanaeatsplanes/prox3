import { Elysia, type status as TypeStatus } from "elysia";
import { errorMessage } from "@/config/language.ts";
import commandHandler from "@/events/command.ts";
import emojiSuggest from "@/events/emojiSuggest.ts";
import eventHandler from "@/events/event.ts";
import {
	CommandBody,
	EmojiSuggestPayload,
	SlackEventBody,
	type SlackInboundRequest,
} from "@/models/event.ts";
import { chatPostEphemeral, chatPostMessage } from "@/utils/slack/client.ts";
import { extractEvent, verifySlackRequest } from "@/utils/slack/middleware.ts";

function extractErrorReason(error: Error): string {
	const message = error.message;

	const parsed = JSON.parse(message);
	if (parsed.type === "validation") {
		const issue = parsed.on || "unknown";
		return `validation error on ${issue}`;
	}
	if (parsed.error) {
		return parsed.error;
	}

	return message;
}

function onFail(body: SlackInboundRequest, error: Error) {
	const rayId = Math.random().toString(36).slice(2, 10);
	const type = "type" in body ? body.type : "command";
	const message = extractErrorReason(error);
	console.error(`[events] [${rayId}] ${type} failed: ${error.message}`);
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
	.state("rawBody", "")
	.onParse(async ({ request, contentType, store }) => {
		const rawBody = await request.text();
		store.rawBody = rawBody;
		return extractEvent(rawBody, contentType);
	})
	.derive(async ({ headers, store }) => {
		const timestamp = headers["x-slack-request-timestamp"];
		const slackSignature = headers["x-slack-signature"];
		if (!timestamp || !slackSignature) {
			return {
				verified: false,
			};
		}
		return {
			verified: await verifySlackRequest(timestamp, slackSignature, store.rawBody),
		};
	})
	.onBeforeHandle(
		({ verified, status, body }: { verified: boolean; status: typeof TypeStatus; body: unknown }) => {
			if (!verified) {
				return status(401, { error: "not signed", status: "error" });
			}
			if (
				typeof body === "object" &&
				body !== null &&
				"type" in body &&
				body.type === "url_verification" &&
				"challenge" in body
			) {
				return {
					challenge: body.challenge ?? "",
				};
			}
		}
	)
	.onError(({ error, path }) => {
		if ("code" in error && error.code === "VALIDATION") {
			return;
		}
		console.error(`[events] error on ${path}:`, error);
	})
	.post(
		"/events",
		async ({ body }) => {
			eventHandler(body).catch((error) => onFail(body as SlackInboundRequest, error as Error));
		},
		{
			body: SlackEventBody,
		}
	)
	.post(
		"/command",
		({ body }) => {
			commandHandler(body).catch((error) => onFail(body as SlackInboundRequest, error as Error));
		},
		{
			body: CommandBody,
		}
	)
	.post(
		"/emoji",
		async ({ body }) => {
			const response = await emojiSuggest(body.value);
			console.log(response);
			return response;
		},
		{
			body: EmojiSuggestPayload,
		}
	);
