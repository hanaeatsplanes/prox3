import { Confession } from "@/models/confession.ts";
import { ErrorWithStatus } from "@/models/error.ts";
import { hasStaged, setStaged } from "@/utils/db/dm.ts";
import { chatUpdate } from "@/utils/slack/client.ts";

type Payload = {
  actions: {
    action_id: string;
    block_id: string;
    text: {
      type: string;
      text: string;
      emoji: boolean;
    };
    value: string;
    style: string;
    type: string;
    action_ts: string;
  }[];
  api_app_id: string;
  channel: {
    id: string;
    name: string;
  };
  container: {
    type: string;
    message_ts: string;
    channel_id: string;
    is_ephemeral: boolean;
    thread_ts: string;
  };
  enterprise: {
    id: string;
    name: string;
  };
  is_enterprise_install: boolean;
  message: {
    subtype: string;
    bot_id: string;
    thread_ts: string;
    root: {
      user: string;
      type: string;
      ts: string;
      client_msg_id: string;
      text: string;
      team: string;
      thread_ts: string;
      reply_count: number;
      reply_users_count: number;
      latest_reply: string;
      reply_users: string[];
      is_locked: boolean;
      subscribed: boolean;
      last_read: string;
      blocks: {
        type: string;
        block_id: string;
        elements: {
          type: string;
          elements: {
            type: string;
            text: string;
          }[];
        }[];
      }[];
    };
    user: string;
    type: string;
    ts: string;
    app_id: string;
    text: string;
    blocks: (
      | {
          type: string;
          block_id: string;
          text: {
            type: string;
            text: string;
            emoji: boolean;
          };
          elements?: undefined;
        }
      | {
          type: string;
          block_id: string;
          elements: {
            type: string;
            action_id: string;
            text: {
              type: string;
              text: string;
              emoji: boolean;
            };
            style: string;
            value: string;
          }[];
          text?: undefined;
        }
    )[];
  };
  response_url: string;
  state: {
    values: unknown;
  };
  team: {
    id: string;
    domain: string;
    enterprise_id: string;
    enterprise_name: string;
  };
  token: string;
  trigger_id: string;
  type: string;
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
};

export default async function (payload: Payload) {
  const action = payload.actions[0];
  if (!action) {
    throw new ErrorWithStatus("no action found in block action", 400);
  }
  switch (action.action_id) {
    case "stage_confession": {
      const { container } = payload;
      if (await hasStaged(container.thread_ts)) return;

      const confession = new Confession(action.value, payload.user.id);
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
