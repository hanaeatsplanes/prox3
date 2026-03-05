export const stagingBlocks = (
  id: number,
  confession: string
): {
  type: string;
  text?: { type: string; text: string };
  elements?: {
    type: string;
    action_id: string;
    text: { type: string; text: string; emoji: boolean };
    value: string;
  }[];
}[] => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `(staging) *${id}* ${confession}`,
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        action_id: "approve",
        text: {
          type: "plain_text",
          text: ":true: Approve",
          emoji: true,
        },
        value: "approve",
      },
      {
        type: "button",
        action_id: "disapprove",
        text: {
          type: "plain_text",
          text: ":x: Reject",
          emoji: true,
        },
        value: "disapprove",
      },
      {
        type: "button",
        action_id: "approve:tw",
        text: {
          type: "plain_text",
          text: ":angerydog: Approve with TW",
          emoji: true,
        },
        value: "approve:tw",
      },
      {
        type: "button",
        action_id: "approve:meta",
        text: {
          type: "plain_text",
          text: ":office: Approve for meta",
          emoji: true,
        },
        value: "approve:meta",
      },
    ],
  },
];
export const confirmStaging = (
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
