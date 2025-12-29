import { Context } from "elysia";
import verifySlackSig from "@/lib/verifySlackSig";
import dmReceived from "@/lib/dmReceived";

export default async function handleSlackEvent(context: Context) {
	const { body, headers, set, status } = context;

	try {
		if (!headers['x-slack-request-timestamp']) {
			throw new Error("`X-Slack-Request-Timestamp` is missing");
		}

		const timestamp = parseInt(headers['x-slack-request-timestamp']!)

		if (Date.now() / 1000 - timestamp > 300) {
			throw new Error("`X-Slack-Request-Timestamp` is too old, reject");
		}

		if (!headers['x-slack-signature']) {
			throw new Error("`X-Slack-Signature is missing");
		}

		const signature = headers["x-slack-signature"]

		if (!verifySlackSig(`${timestamp}`, body as string, signature)) {
			set.status = 401
			return "invalid signature"
		}

		const event = JSON.parse(body as string)

		if (event.type === "url_verification") {
			return event.challenge
		}

		if (event.type === "event_callback") {
			const iEvent = event.event

			if (iEvent.bot_id || iEvent.subtype) {
				return status(200)
			}

			if (iEvent.type === "message" && iEvent.channel_type === "im") {
				await dmReceived(iEvent.ts, iEvent.channel, iEvent.text)
				return status(200)
			}

			throw new Error(`Received (inner) event type ${iEvent.type}`)
		}

		throw new Error(`Received event type ${event.type}`)

	} catch (error) {
		console.error("[handleSlackEvent] Internal error:", error);
		set.status = 500
		return "internal server error"
	}
}
