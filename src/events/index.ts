import { type Context, Elysia } from "elysia";
import dmedConfessionHandler from "@/events/dmedConfessionHandler.ts";
import { validateSlackRequest } from "@/utils";

const app = new Elysia();

app.post("/api/events", async ({ request, status }: Context) => {
	const rawBody = await validateSlackRequest(request);
	if (!rawBody) {
		status("Unauthorized");
		return JSON.stringify({ status: "unauthorized" });
	}

	const body = JSON.parse(rawBody);

	const { type } = body;
	if (type === "url_verification") {
		return body.challenge;
	}

	if (type === "event_callback") {
		const { event } = body;
		if (
			event.type === "message" &&
			event.channel_type === "im" &&
			!event.bot_id
		) {
			const confession = event.text;
			dmedConfessionHandler(confession, event.channel, event.ts);
		}
	}

	return JSON.stringify({ status: "ok" });
});

export default app;
