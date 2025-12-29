import { Context } from "elysia";
import dmReceived from "@/lib/dmReceived";
import validateRequest from "@/lib/validateRequest";

export default async function handleSlackEvent(context: Context) {
	const { body, headers, set, status } = context;

	validateRequest(headers, body);

	try {
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
