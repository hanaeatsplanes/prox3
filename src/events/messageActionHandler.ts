import { confessionChannel } from "@/models/channels.ts";
import type { MessageActionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { conversationsReplies } from "@/utils/slack/client.ts";

export default async function messageActionHandler({
	response_url,
	message,
	channel,
	user,
}: MessageActionEvent) {
	if (!(channel.id in confessionChannel)) {
		return;
	}
	const rootMessageId = message.thread_ts ? message.thread_ts : message.ts;
	const response = await conversationsReplies(channel.id, rootMessageId);
	if (!response.ok || response.messages.length === 0) {
		throw new Error("[slack] error on fetching message");
	}
	const rootMessage = response.messages[0];
	if (!rootMessage) {
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
	const confession = await getConfessionBy("approval_ts", rootMessage.ts);
	if (!confession) {
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
}
