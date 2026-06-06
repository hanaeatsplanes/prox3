import { Confession } from "@/models/confession.ts";
import type { CommandBody } from "@/models/event.ts";
import { getConfessionBy, getStagedConfessions } from "@/utils/db/confession.ts";
import { acquireLock, releaseLock } from "@/utils/db/lock.ts";
import { chatPostEphemeral } from "@/utils/slack/client.ts";

export default async function handler({ text, user_id, command, channel_id }: CommandBody) {
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
				if (channel_id !== process.env.CONFESSIONS_REVIEW) {
					throw new Error("/prox3-revive must be run from #confessions-review");
				}
				const confessions = await getStagedConfessions();
				for (const confession of confessions) {
					const { stagingTs } = confession;
					if (!stagingTs || !(await acquireLock(stagingTs))) {
						continue;
					}
					try {
						await confession.revive();
					} finally {
						await releaseLock(stagingTs);
					}
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
				return;
			}
			case "/prox3-self-reject": {
				if (!text) {
					throw new Error("confession id required");
				}
				const id = Number.parseInt(text, 10);
				if (Number.isNaN(id)) {
					throw new Error("confession id is not number");
				}
				const confession = await getConfessionBy("id", id);
				if (!confession?.stagingTs) {
					throw new Error(`corresponding confession to #${id} not found or is broken`);
				}
				if (!confession.sameUser(user_id)) {
					throw new Error("not your confession");
				}
				if (!(await acquireLock(confession.stagingTs))) {
					throw new Error(
						"This confession is currently being processed (likely under review). Please try again in a moment."
					);
				}
				try {
					await confession.selfReject();
				} finally {
					await releaseLock(confession.stagingTs!);
				}

				return;
			}
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "unknown error";
		throw new Error(`command failed: ${message}`);
	}
}
