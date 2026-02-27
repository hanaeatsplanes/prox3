export type SlackEventCallback = {
  token: string;
  team_id: string;
  enterprise_id: string | null;
  context_team_id: string | null;
  context_enterprise_id: string;
  api_app_id: string;
  event: {
    type: string;
    subtype: string;
    message: {
      subtype?: string;
      bot_id?: string;
      thread_ts?: string;
      root?: {
        user: string;
        type: string;
        ts: string;
        client_msg_id?: string;
        text: string;
        thread_ts: string;
        reply_count?: number;
        reply_users_count?: number;
        latest_reply?: string;
        reply_users?: string[];
        is_locked?: boolean;
        subscribed?: boolean;
        blocks?: Array<{
          type: string;
          block_id: string;
          elements?: Array<{
            type: string;
            elements?: Array<{ type: string; text: string }>;
          }>;
        }>;
      };
      user?: string;
      app_id?: string;
      type?: string;
      text: string;
      blocks?: Array<{
        type: string;
        block_id: string;
        text?: { type: string; text: string; emoji: boolean };
        elements?: Array<{
          type: string;
          action_id: string;
          text: { type: string; text: string; emoji: boolean };
          style: string;
          value: string;
        }>;
      }>;
      ts: string;
      source_team?: string;
      user_team?: string;
    };
    previous_message?: Record<string, unknown>;
    channel: string;
    hidden?: boolean;
    ts: string;
    event_ts: string;
    channel_type: string;
  };
  type: string;
  event_id: string;
  event_time: number;
  authorizations?: Array<{
    enterprise_id: string;
    team_id: string;
    user_id: string;
    is_bot: boolean;
    is_enterprise_install: boolean;
  }>;
  is_ext_shared_channel?: boolean;
  event_context?: string;
};

export type BlockActionsPayload = {
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
