import { chatPostMessage } from "@/utils/slack/client";

const payload = (confession: string) => [
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
) {
  await chatPostMessage(dmChannelId, payload(confession), {
    thread_ts: threadTs,
    reply_broadcast: true,
  });
}
