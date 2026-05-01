import { confessionChannel } from "@/models/channels.ts";
import type { MessageActionEvent } from "@/models/event.ts";

export default async function messageActionHandler({
	response_url,
	message,
	channel,
}: MessageActionEvent) {
	if (!(channel.id in confessionChannel)) {
		return;
	}
	if (message.bot_profile?.id !== process.env.SLACK_BOT_ID) {
		await fetch(response_url, {
			body: JSON.stringify({
				replace_original: false,
				text: "Looks like this isn't a Prox3 confession!",
				thread_ts: message.ts,
			}),
			method: "POST",
		});
	}
}
