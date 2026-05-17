import { reactModal, replyModal } from "@/config/language.ts";
import { confessionChannel } from "@/models/channels.ts";
import type { MessageActionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { viewsOpen } from "@/utils/slack/client.ts";

export default async function messageActionHandler({
	response_url,
	message,
	channel,
	user,
	callback_id,
	trigger_id,
}: MessageActionEvent) {
	try {
		console.log(`[message_action] start. channel=${channel.id}, callback=${callback_id}`);
		const channelIds = Object.values(confessionChannel);
		if (!channelIds.includes(channel.id)) {
			console.log(
				`[message_action] channel not in confessionChannel: ${channel.id}, valid=${channelIds}`
			);
			return;
		}
		const rootMessageTs = message.thread_ts ? message.thread_ts : message.ts;
		const confession = await getConfessionBy("approval_ts", rootMessageTs);
		if (!confession) {
			await fetch(response_url, {
				body: JSON.stringify({
					replace_original: false,
					text: "This confession is NOT in the database, perhaps this isn't a bot confession?",
					thread_ts: message.ts,
				}),
				method: "POST",
			});
			return;
		}
		if (!confession.sameUser(user.id)) {
			console.log(`[message_action] user ${user.id} does not own confession ${confession.id}`);
			await fetch(response_url, {
				body: JSON.stringify({
					replace_original: false,
					text: "This is not your confession.",
					thread_ts: message.ts,
				}),
				method: "POST",
			});
			return;
		}
		switch (callback_id) {
			case "react_anon":
				await viewsOpen(trigger_id, reactModal(rootMessageTs, message.ts, confession.channel!));
				return;
			case "reply_anon":
				await viewsOpen(trigger_id, replyModal(rootMessageTs));
				return;
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "unknown error";
		throw new Error(`message action failed: ${message}`);
	}
}
