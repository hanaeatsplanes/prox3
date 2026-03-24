import { Confession } from "@/models/confession.ts";
import type { BlockActionEvent } from "@/models/event.ts";
import { hasStaged, setStaged } from "@/utils/db/dm.ts";
import { chatDelete, chatUpdate } from "@/utils/slack/client.ts";

export default async function (body: BlockActionEvent): Promise<void> {
  const action = body.actions[0];
  if (!action) {
    console.error("no action found in block action");
    return;
  }
  switch (action.action_id) {
    case "stage_confession": {
      const { container } = body;
      if (await hasStaged(container.thread_ts)) return;

      const confession = await Confession.create(action.value, body.user.id);
      await confession.stage();

      Promise.all([
        chatUpdate(
          container.message_ts,
          container.channel_id,
          `Staged as confession ${confession.id}`
        ).catch(console.error),
        setStaged(container.thread_ts),
      ]).error(console.error);
      break;
    }
    case "do-not-stage": {
      const { container } = body;
      await chatDelete(container.message_ts, container.channel_id);
      break;
    }
  }
}
