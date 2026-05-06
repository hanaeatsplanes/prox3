import { reactModal, replyModal } from "@/config/language.ts";
import { confessionChannel } from "@/models/channels.ts";
import type { MessageActionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { conversationsReplies, viewsOpen } from "@/utils/slack/client.ts";

export default async function messageActionHandler({
	response_url,
	message,
	channel,
	user,
	callback_id,
	trigger_id,
}: MessageActionEvent) {
	console.log(`[message_action] start. channel=${channel.id}, callback=${callback_id}`);
	const channelIds = Object.values(confessionChannel);
	if (!channelIds.includes(channel.id)) {
		console.log(
			`[message_action] channel not in confessionChannel: ${channel.id}, valid=${channelIds}`
		);
		return;
	}
	const rootMessageId = message.thread_ts ? message.thread_ts : message.ts;
	console.log(`[message_action] fetching root message: ${rootMessageId}`);
	const response = await conversationsReplies(channel.id, rootMessageId);
	if (!response.ok || response.messages.length === 0) {
		throw new Error("[slack] error on fetching message");
	}
	const rootMessage = response.messages[0];
	if (!rootMessage) {
		console.log(`[message_action] no root message found`);
		await fetch(response_url, {
			body: JSON.stringify({
				replace_original: false,
				text: "Looks like there's no root message... maybe you made a mistake?",
				thread_ts: message.ts,
			}),
			method: "POST",
		});
		return;
	}
	if (rootMessage?.bot_id !== process.env.SLACK_BOT_ID) {
		console.log(
			`[message_action] root message not from bot. bot_id=${rootMessage.bot_id}, expected=${process.env.SLACK_BOT_ID}`
		);
		await fetch(response_url, {
			body: JSON.stringify({
				replace_original: false,
				text: "Looks like this isn't a Prox3 confession!",
				thread_ts: message.ts,
			}),
			method: "POST",
		});
		return;
	}
	console.log(`[message_action] looking up confession by approval_ts=${rootMessage.ts}`);
	const confession = await getConfessionBy("approval_ts", rootMessage.ts);
	if (!confession) {
		console.log(`[message_action] confession not found for ts=${rootMessage.ts}`);
		await fetch(response_url, {
			body: JSON.stringify({
				replace_original: false,
				text: "This confession is NOT in the database, perhaps the DB was wiped??",
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
			await viewsOpen(trigger_id, reactModal(rootMessageId));
			return;
		case "reply_anon":
			await viewsOpen(trigger_id, replyModal(rootMessageId));
			return;
	}
}
