import { type Context, Elysia } from "elysia";
import { Confession } from "@/core/confession.ts";
import { getStagedConfessions } from "@/utils/db/confession.ts";
import { chatDelete, chatPostEphemeral } from "@/utils/slack/client.ts";
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

async function reviveConfessions() {
	const confessions = await getStagedConfessions();
	for (const confession of confessions) {
		await confession.revive();
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}
async function handleValidatedCommand(rawBody: string) {
	const { text, user_id, command } = extractCommandBody(rawBody);
	switch (command) {
		case "prox3":
			return stageConfession(text, user_id);
		case "prox3-revive":
			return reviveConfessions();
	}
	// todo: check for revive
}

async function stageConfession(text: string, userId: string) {
	const confession = await Confession.create(text, userId);
	await confession.stage();
	await chatPostEphemeral(
		userId,
		userId,
		`Staged as confession ${confession.id}`
	);
}

export default new Elysia().post("/api/command", handler);
