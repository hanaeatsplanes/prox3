import { confirmStaging } from "@/config/language/staging";
import { chatPostMessage } from "@/utils/slack/client";
import { sanitizeMessage } from "@/utils/slack/middleware";

export default async function (
  confession: string,
  dmChannelId: string,
  threadTs: string
): Promise<void> {
  await chatPostMessage(
    dmChannelId,
    confirmStaging(sanitizeMessage(confession)),
    {
      reply_broadcast: true,
      thread_ts: threadTs,
    }
  );
}
