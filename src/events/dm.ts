import { confirmStagingMessage } from "@/config/language.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";

export default async function (dmChannelId: string, threadTs: string) {
	try {
		await chatPostMessage(dmChannelId, confirmStagingMessage, {
			reply_broadcast: true,
			thread_ts: threadTs,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "unknown error";
		throw new Error(`dm post failed: ${message}`);
	}
}
