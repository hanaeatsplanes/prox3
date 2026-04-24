import { confirmStagingMessage } from "@/config/language/index.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";

export default async function (dmChannelId: string, threadTs: string) {
	await chatPostMessage(dmChannelId, confirmStagingMessage, {
		reply_broadcast: true,
		thread_ts: threadTs,
	});
}
