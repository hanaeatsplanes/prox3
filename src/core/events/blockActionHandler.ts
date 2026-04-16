import { Confession } from "@/core/confession.ts";
import type { BlockActionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { hasStaged, setStaged } from "@/utils/db/dm.ts";
import { chatDelete, chatUpdate } from "@/utils/slack/client.ts";

export default async function (body: BlockActionEvent) {
	const action = body.actions[0];
	if (!action) {
		console.error("[button] no action found in block action");
		return;
	}
	const { container } = body;
	switch (action.action_id) {
		case "stage_confession": {
			if (await hasStaged(container.thread_ts)) {
				return;
			}

			const confession = await Confession.create(action.value, body.user.id);
			await confession.stage();

			await Promise.all([
				chatUpdate(
					container.message_ts,
					container.channel_id,
					`Staged as confession ${confession.id}`
				).catch((err) => console.error("[button] chatUpdate failed:", err)),
				setStaged(container.thread_ts),
			]).catch((err) => console.error("[button] post-stage cleanup failed:", err));
			break;
		}
		case "do-not-stage": {
			await chatDelete(container.message_ts, container.channel_id);
			break;
		}
		case "approve": {
			const ts = container.message_ts;
			const confession = await getConfessionBy("staging_ts", ts);

			if (!confession) {
				throw new Error("[button] no confession found in block action");
			}

			break;
		}
		case "disapprove":
		case "approve:tw":
		case "approve:meta":
			throw new Error(
				`[button] action "${action.action_id}" is not yet implemented`
			);
		default: {
			console.error(`[button] unhandled action: ${action.action_id}`);
		}
	}
}
