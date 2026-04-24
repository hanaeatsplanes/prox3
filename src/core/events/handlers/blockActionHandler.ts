import { twModal } from "@/config/language";
import { Confession } from "@/core/confession.ts";
import type { BlockActionEvent } from "@/models/event.ts";
import { cache, isCached, isUndoCached, undoCache } from "@/utils/db/cache.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { chatDelete, chatUpdate, viewsOpen } from "@/utils/slack/client.ts";

export default async function (body: BlockActionEvent) {
	const action = body.actions[0];
	if (!action) {
		throw new Error("[button] no action found in block action");
	}
	const { container } = body;
	if (
		(await isCached(container.message_ts)) &&
		(action.action_id !== "undo" || !(await isUndoCached(container.message_ts)))
	) {
		return;
	}
	void cache(container.message_ts);
	if (action.action_id === "undo") {
		void undoCache(container.message_ts);
	}
	switch (action.action_id) {
		case "stage_confession": {
			const confession = await Confession.create(action.value, body.user.id);
			await confession.stage();

			await chatUpdate(
				container.message_ts,
				container.channel_id,
				`:true: Staged as confession ${confession.id}`
			);
			break;
		}
		case "do-not-stage": {
			await chatDelete(container.message_ts, container.channel_id);
			break;
		}
		case "approve":
		case "approve:meta": {
			const ts = container.message_ts;
			const confession = await getConfessionBy("staging_ts", ts);

			if (!confession) {
				throw new Error("[button] no confession found in block action");
			}

			const channel =
				action.action_id === "approve" ? process.env.CONFESSIONS : process.env.META;

			await confession.approve(channel, body.user.id);
			break;
		}
		case "disapprove": {
			const ts = container.message_ts;
			const confession = await getConfessionBy("staging_ts", ts);

			if (!confession) {
				throw new Error("[button] no confession found in block action");
			}

			await confession.reject(body.user.id);
			break;
		}
		case "undo": {
			const ts = container.message_ts;
			const confession = await getConfessionBy("staging_ts", ts);

			if (!confession) {
				throw new Error("[button] no confession found in block action");
			}
			await confession.undo(body.user.id);
			break;
		}
		case "approve:tw": {
			const ts = container.message_ts;
			await viewsOpen(body.trigger_id, twModal(ts));
			break;
		}
		default: {
			throw new Error(`[button] unhandled action: ${action.action_id}`);
		}
	}
}
