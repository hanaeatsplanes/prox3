import dmReceived from "./dmRecieved";
import {InnerEvent, OuterEvent} from "../lib/models";

export function slackEventHandler(body: any, status: (code: number, message: string) => unknown) {
	if (!body) {
		return status(405, "Method Not Allowed")
	}
	switch (body.type || "") {
		case "url_verification":
			return body.challenge;

		case "event_callback":
			if (!body.event) {
				status(405, "Method Not Allowed")
			}

			if (body.event.type === "message" && body.event.channel_type === "im") dmReceived(body);

			return status(200, "OK")

		default:
			return status(405, "Method Not Allowed")
	}
}