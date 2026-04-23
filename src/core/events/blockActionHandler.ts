import { Confession } from "@/core/confession.ts";
import { confessionChannel } from "@/models/channels.ts";
import type { BlockActionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { cache, isCached } from "@/utils/db/dm.ts";
import { chatDelete, chatUpdate } from "@/utils/slack/client.ts";

export default async function (body: BlockActionEvent) {
	const action = body.actions[0];
	if (!action) {
		throw new Error("[button] no action found in block action");
	}
	const { container } = body;
	if (await isCached(container.message_ts)) {
		return;
	}
	await cache(container.message_ts);
	switch (action.action_id) {
		case "stage_confession": {
			const confession = await Confession.create(action.value, body.user.id);
			await confession.stage();

			await chatUpdate(
				container.message_ts,
				container.channel_id,
				`Staged as confession ${confession.id}`
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
		case "approve:tw":
			throw new Error(
				`[button] action "${action.action_id}" is not yet implemented`
			);
		default: {
			throw new Error(`[button] unhandled action: ${action.action_id}`);
		}
	}
}
