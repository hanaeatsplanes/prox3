import { confirmStaging } from "@/config/language/index.ts";
import { chatPostMessage } from "@/utils/slack/client";
import { sanitizeMessage } from "@/utils/slack/middleware";

export default async function (
	confession: string,
	dmChannelId: string,
	threadTs: string
) {
	await chatPostMessage(
		dmChannelId,
		confirmStaging(sanitizeMessage(confession)),
		{
			reply_broadcast: true,
			thread_ts: threadTs,
		}
	);
}
