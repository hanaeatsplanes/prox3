import { type Context, Elysia } from "elysia";
import { Confession } from "@/models/confession.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";
import {
	extractCommandBody,
	verifySlackRequest,
} from "@/utils/slack/middleware.ts";

async function handler({ request }: Context): Promise<void> {
	const rawBody = await request.text();
	if (!(await verifySlackRequest(request, rawBody))) {
		console.error("[command] failed slack request verification");
		return;
	}
	const { text, user_id } = extractCommandBody(rawBody);
	console.log(`[command] received from user, text length: ${text.length}`);
	// todo: check for revive
	(async (): Promise<void> => {
		const confession = await Confession.create(text, user_id);
		await confession.stage();
		await confession.updateDB();
		await chatPostMessage(user_id, `Staged as confession ${confession.id}`);
		console.log(`[command] staged confession ${confession.id}`);
	})().catch((err) => {
		console.error("[command] failed to stage confession:", err);
	});
}

export default new Elysia().post("/api/command", handler);
