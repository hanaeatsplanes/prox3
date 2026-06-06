import { twModal } from "@/config/language.ts";
import { Confession } from "@/models/confession.ts";
import type { BlockActionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { acquireLock, releaseLock } from "@/utils/db/lock.ts";
import { chatDelete, chatUpdate, conversationsReplies, viewsOpen } from "@/utils/slack/client.ts";

export default async function (body: BlockActionEvent) {
	const action = body.actions[0];
	if (!action) {
		throw new Error("no action found");
	}
	const { container } = body;
	const ts = container.message_ts;
	const channelId = container.channel_id;
	if (!channelId) {
		throw new Error(`missing channel for action: ${action.action_id}`);
	}

	if (!(await acquireLock(ts))) {
		return;
	}

	if (action.action_id === "approve:tw") {
		try {
			await viewsOpen(body.trigger_id, twModal(ts));
		} catch (err) {
			await releaseLock(ts);
			throw new Error(`button click failed: ${err instanceof Error ? err.message : `${err}`}`);
		}
		return;
	}

	try {
		switch (action.action_id) {
			case "stage-confession": {
				if (!container.thread_ts) {
					throw new Error("stage-confession triggered on root message");
				}
				const thread = await conversationsReplies(channelId, container.thread_ts);
				if (!thread.ok || !thread.messages[0]) {
					throw new Error("failed to fetch confession text");
				}
				const confessionText = thread.messages[0].text;
				const confession = await Confession.create(confessionText, body.user.id);
				await confession.stage();

				await chatUpdate(ts, channelId, `:true: Staged as confession ${confession.id}`);
				break;
			}
			case "do-not-stage": {
				await chatDelete(ts, channelId);
				break;
			}
			case "approve":
			case "approve:meta": {
				const confession = await getConfessionBy("staging_ts", ts);

				if (!confession) {
					throw new Error("confession not found");
				}

				const channel = action.action_id === "approve" ? process.env.CONFESSIONS : process.env.META;

				await confession.approve(channel, body.user.id);
				break;
			}
			case "disapprove": {
				const confession = await getConfessionBy("staging_ts", ts);

				if (!confession) {
					throw new Error("confession not found");
				}

				await confession.reject(body.user.id);
				break;
			}
			case "undo": {
				const confession = await getConfessionBy("staging_ts", ts);

				if (!confession) {
					throw new Error("confession not found");
				}
				await confession.undo(body.user.id);
				break;
			}
			default: {
				throw new Error(`unknown action: ${action.action_id}`);
			}
		}
	} catch (err) {
		throw new Error(`button click failed: ${err instanceof Error ? err.message : `${err}`}`);
	} finally {
		await releaseLock(ts);
	}
}
