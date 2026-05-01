import { twModal } from "@/config/language/index.ts";
import { Confession } from "@/core/confession.ts";
import type { BlockActionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import {
	clearLock,
	clearUndoLock,
	isLocked,
	isUndoLocked,
} from "@/utils/db/lock.ts";
import {
	chatDelete,
	chatUpdate,
	conversationsReplies,
	viewsOpen,
} from "@/utils/slack/client.ts";

export default async function (body: BlockActionEvent) {
	const action = body.actions[0];
	if (!action) {
		throw new Error("[button] no action found in block action");
	}
	const { container } = body;
	const ts = container.message_ts;

	// handling before is not that risky, low chance for accidental double click so can be lock-free
	if (action.action_id === "approve:tw") {
		await viewsOpen(body.trigger_id, twModal(ts));
		return;
	}

	if (action.action_id === "undo" && (await isUndoLocked(ts))) {
		return;
	} else if (await isLocked(ts)) {
		return;
	}

	try {
		switch (action.action_id) {
			case "stage-confession": {
				const thread = await conversationsReplies(
					container.channel_id,
					container.thread_ts
				);
				if (!thread.ok || !thread.messages[0]) {
					throw new Error("[button] failed to fetch confession text from thread");
				}
				const confessionText = thread.messages[0].text;
				const confession = await Confession.create(confessionText, body.user.id);
				await confession.stage();

				await chatUpdate(
					ts,
					container.channel_id,
					`:true: Staged as confession ${confession.id}`
				);
				break;
			}
			case "do-not-stage": {
				await chatDelete(ts, container.channel_id);
				break;
			}
			case "approve":
			case "approve:meta": {
				const confession = await getConfessionBy("staging_ts", ts);

				if (!confession) {
					throw new Error("[button] no confession found in block action");
				}

				const channel =
					action.action_id === "approve"
						? process.env.CONFESSIONS
						: process.env.META;

				await confession.approve(channel, body.user.id);
				break;
			}
			case "disapprove": {
				const confession = await getConfessionBy("staging_ts", ts);

				if (!confession) {
					throw new Error("[button] no confession found in block action");
				}

				await confession.reject(body.user.id);
				break;
			}
			case "undo": {
				const confession = await getConfessionBy("staging_ts", ts);

				if (!confession) {
					throw new Error("[button] no confession found in block action");
				}
				await confession.undo(body.user.id);
				break;
			}
			default: {
				throw new Error(`[button] unhandled action: ${action.action_id}`);
			}
		}
	} catch (error) {
		await clearLock(ts).catch((e) =>
			console.error(`[button] failed to clear cache for ${ts}`, e)
		);
		if (action.action_id === "undo") {
			await clearUndoLock(ts).catch((e) =>
				console.error(`[button] failed to clear undo cache for ${ts}`, e)
			);
		}
		throw error;
	}
}
