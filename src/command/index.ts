import { type Context, Elysia } from "elysia";
import { Confession } from "@/models/confession.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";
import {
	extractCommandBody,
	verifySlackRequest,
} from "@/utils/slack/middleware.ts";

async function handler({ request }: Context) {
	const rawBody = await request.text();
	if (!(await verifySlackRequest(request, rawBody))) {
		console.error("[command] failed slack request verification");
		return;
	}
	const { text, user_id } = extractCommandBody(rawBody);
	stageConfession(text, user_id).catch(
		(reason) => `[command] confession not staged: ${reason}`
	);
	console.log(`[command] received from user, text length: ${text.length}`);
	// todo: check for revive
}

async function stageConfession(text: string, userId: string) {
	const confession = await Confession.create(text, userId);
	await confession.stage();
	await confession.updateDB();
	await chatPostMessage(userId, `Staged as confession ${confession.id}`);
	console.log(`[command] staged confession ${confession.id}`);
}

export default new Elysia().post("/api/command", handler);
