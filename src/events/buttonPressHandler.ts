import { Confession } from "@/models/confession.ts";
import { ErrorWithStatus } from "@/models/error.ts";
import type { ButtonPressBody } from "@/models/event.ts";
import { hasStaged, setStaged } from "@/utils/db/dm.ts";
import { chatUpdate } from "@/utils/slack/client.ts";

export default async function (body: ButtonPressBody): Promise<void> {
  const action = body.actions[0];
  if (!action) {
    throw new ErrorWithStatus("no action found in block action", 400);
  }
  switch (action.action_id) {
    case "stage_confession": {
      const { container } = body;
      if (await hasStaged(container.thread_ts)) return;

      const confession = await Confession.create(action.value, body.user.id);
      await confession.stage();

      chatUpdate(
        container.message_ts,
        container.channel_id,
        `Staged as confession ${confession.id}`
      ).catch(console.error);

      await setStaged(container.thread_ts);
    }
  }
}

