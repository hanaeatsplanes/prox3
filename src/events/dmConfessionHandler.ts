import { confirmStaging } from "@/config/language/staging";
import { chatPostMessage } from "@/utils/slack/client";

export default async function (
  confession: string,
  dmChannelId: string,
  threadTs: string
): Promise<void> {
  await chatPostMessage(dmChannelId, confirmStaging(confession), {
    thread_ts: threadTs,
    reply_broadcast: true,
  });
}
