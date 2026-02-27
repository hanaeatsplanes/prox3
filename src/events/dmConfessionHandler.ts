import { chatPostMessage } from "@/utils/slack/client";

const responseBlocks = (
  confession: string
): Array<{
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{
    type: string;
    style: string;
    text: { type: string; text: string; emoji?: boolean };
    value: string;
    action_id: string;
    emoji?: true;
  }>;
}> => [
  {
    type: "section",
    text: {
      type: "plain_text",
      text: "Would you like to stage this confession?",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        style: "primary",
        text: {
          type: "plain_text",
          text: "Yes",
        },
        value: confession,
        action_id: "stage_confession",
      },
      {
        type: "button",
        style: "danger",
        text: {
          type: "plain_text",
          text: "No",
          emoji: true,
        },
        value: "do-not-stage",
        action_id: "do-not-stage",
      },
    ],
  },
];

export default async function (
  confession: string,
  dmChannelId: string,
  threadTs: string
): Promise<void> {
  await chatPostMessage(dmChannelId, responseBlocks(confession), {
    thread_ts: threadTs,
    reply_broadcast: true,
  });
}

