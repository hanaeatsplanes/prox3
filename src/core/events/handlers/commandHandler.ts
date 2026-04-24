import { type Context, Elysia } from "elysia";
import { Confession } from "@/core/confession.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";
import {
	extractCommandBody,
	verifySlackRequest,
} from "@/utils/slack/middleware.ts";

async function handler({ request, set }: Context) {
	const rawBody = await request.text();
	if (!(await verifySlackRequest(request, rawBody))) {
		console.error("[command] failed slack request verification");
		set.status = 503;
		return;
	}

	void handleValidatedCommand(rawBody).catch((error) => {
		console.error("[command] confession not staged:", error);
	});
}

async function handleValidatedCommand(rawBody: string) {
	const { text, user_id } = extractCommandBody(rawBody);
	await stageConfession(text, user_id);
	// todo: check for revive
}

async function stageConfession(text: string, userId: string) {
	const confession = await Confession.create(text, userId);
	await confession.stage();
	await chatPostMessage(userId, `Staged as confession ${confession.id}`);
}

export default new Elysia().post("/api/command", handler);
