import { Confession } from "@/core/confession.ts";
import type { BlockActionEvent } from "@/models/event.ts";
import { hasStaged, setStaged } from "@/utils/db/dm.ts";
import { chatDelete, chatUpdate } from "@/utils/slack/client.ts";

export default async function (body: BlockActionEvent) {
	const action = body.actions[0];
	if (!action) {
		console.error("[button] no action found in block action");
		return;
	}
	switch (action.action_id) {
		case "stage_confession": {
			const { container } = body;
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
			const { container } = body;
			await chatDelete(container.message_ts, container.channel_id);
			break;
		}
		default: {
			console.error(`[button] unhandled action: ${action.action_id}`);
		}
	}
}
