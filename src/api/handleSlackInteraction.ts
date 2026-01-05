import { Context } from "elysia";
import validateRequest from "@/lib/validateRequest";
import stageConfession from "@/lib/stageConfess";

export default async function handleSlackInteraction(context: Context) {
	const { body, headers, status } = context;

	validateRequest(headers, body);

	try {
		const params = new URLSearchParams(body as string)
		const payload = JSON.parse(params.get("payload")!);
		if (payload.type === "block_actions") {
			const actions: {
				"action-id": string,
				"value": string,
			}[] = payload.actions
			const action = actions[0]

			const ts: string = payload.message.ts
			const slackId = payload.user.id as string;

			if (action["action-id"] === "stage-confession") {
				const confession = action["value"]
				const id = await stageConfession(
					confession,
					slackId,
				)
			}
			else if (action["action-id"] === "do-not-stage") {
				// TODO delete
			}

		} else {
			throw new Error("unknown payload type: " + payload.type);
		}
	} catch (e) {
		console.error(e)
		throw e
	}
}