import { Confession } from "@/models/confession.ts";
import { ErrorWithStatus } from "@/models/error.ts";

const examplePayload = {
  type: "block_actions",
  user: {
    id: "U081C6XT885",
    username: "hanabanana",
    name: "hanabanana",
    team_id: "T0266FRGM",
  },
  api_app_id: "A0A6KFHLW8G",
  token: "HhhhfbQNuxeTp075PNZ2hd4H",
  container: {
    type: "message",
    message_ts: "1772029201.016649",
    channel_id: "D0A5Q3UJ0VB",
    is_ephemeral: false,
    thread_ts: "1772029199.623479",
  },
  trigger_id: "10584426541300.2210535565.7c88804738e34e5a71f6e3ce862b2695",
  team: {
    id: "T0266FRGM",
    domain: "hackclub",
    enterprise_id: "E09V59WQY1E",
    enterprise_name: "Hack Club",
  },
  enterprise: {
    id: "E09V59WQY1E",
    name: "Hack Club",
  },
  is_enterprise_install: false,
  channel: {
    id: "D0A5Q3UJ0VB",
    name: "directmessage",
  },
  message: {
    subtype: "thread_broadcast",
    bot_id: "B0A5MP71ZLM",
    thread_ts: "1772029199.623479",
    root: {
      user: "U081C6XT885",
      type: "message",
      ts: "1772029199.623479",
      client_msg_id: "5284df1d-639c-4c5f-ab18-f7c8e2b75d95",
      text: "hello",
      team: "T0266FRGM",
      thread_ts: "1772029199.623479",
      reply_count: 1,
      reply_users_count: 1,
      latest_reply: "1772029201.016649",
      reply_users: ["U0A59NW9G87"],
      is_locked: false,
      subscribed: true,
      last_read: "1772029199.623479",
      blocks: [
        {
          type: "rich_text",
          block_id: "ZL1yL",
          elements: [
            {
              type: "rich_text_section",
              elements: [
                {
                  type: "text",
                  text: "hello",
                },
              ],
            },
          ],
        },
      ],
    },
    user: "U0A59NW9G87",
    type: "message",
    ts: "1772029201.016649",
    app_id: "A0A6KFHLW8G",
    text: "Would you like to stage this confession? Yes button No button",
    blocks: [
      {
        type: "section",
        block_id: "RZqui",
        text: {
          type: "plain_text",
          text: "Would you like to stage this confession?",
          emoji: true,
        },
      },
      {
        type: "actions",
        block_id: "47r2H",
        elements: [
          {
            type: "button",
            action_id: "stage_confession",
            text: {
              type: "plain_text",
              text: "Yes",
              emoji: true,
            },
            style: "primary",
            value: "hello",
          },
          {
            type: "button",
            action_id: "do-not-stage",
            text: {
              type: "plain_text",
              text: "No",
              emoji: true,
            },
            style: "danger",
            value: "do-not-stage",
          },
        ],
      },
    ],
  },
  state: {
    values: {},
  },
  response_url:
    "https://hooks.slack.com/actions/T0266FRGM/10577396110293/oguy89uZ7WFpJJgw8fvSSOEX",
  actions: [
    {
      action_id: "stage_confession",
      block_id: "47r2H",
      text: {
        type: "plain_text",
        text: "Yes",
        emoji: true,
      },
      value: "hello",
      style: "primary",
      type: "button",
      action_ts: "1772029217.821456",
    },
  ],
};
type Payload = typeof examplePayload;
// TODO: remove ^^^

export default function (payload: Payload) {
  const action = payload.actions[0];
  if (!action) {
    throw new ErrorWithStatus("no action found in block action", 400);
  }
  switch (action.action_id) {
    case "stage_confession": {
      const confession = new Confession(action.value, payload.user.id);
      confession.stage().catch(console.error);
    }
  }
}
