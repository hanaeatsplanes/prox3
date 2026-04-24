import { confirmStagingMessage } from "@/config/language/index.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";
import { sanitizeMessage } from "@/utils/slack/middleware.ts";

export default async function (
	confession: string,
	dmChannelId: string,
	threadTs: string
) {
	await chatPostMessage(
		dmChannelId,
		confirmStagingMessage(sanitizeMessage(confession)),
		{
			reply_broadcast: true,
			thread_ts: threadTs,
		}
	);
}
