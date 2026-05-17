import { Confession } from "@/models/confession.ts";
import type { CommandBody } from "@/models/event.ts";
import { getStagedConfessions } from "@/utils/db/confession.ts";
import { chatPostEphemeral } from "@/utils/slack/client.ts";

export default async function handler({ text, user_id, command }: CommandBody) {
	try {
		switch (command) {
			case "/prox3": {
				if (!text) {
					throw new Error("confession text is required");
				}
				const confession = await Confession.create(text, user_id);
				await confession.stage();
				await chatPostEphemeral(user_id, user_id, `Staged as confession ${confession.id}`);
				return;
			}
			case "/prox3-revive": {
				const confessions = await getStagedConfessions();
				for (const confession of confessions) {
					await confession.revive();
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
				return;
			}
			case "/prox3-self-delete": {
				return;
			}
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "unknown error";
		throw new Error(`command failed: ${message}`);
	}
}
