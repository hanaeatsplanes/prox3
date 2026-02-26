import type { ConfessionChannel } from "@/config/channels";
import { nextId } from "@/utils/db/confession.ts";
import { hash } from "@/utils/hash";
import { chatPostMessage } from "@/utils/slack/client.ts";

const stagingBlocks = (
  id: number,
  confession: string
): Array<{
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{
    type: string;
    action_id: string;
    text: { type: string; text: string; emoji: boolean };
    value: string;
  }>;
}> => [
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

export class Confession {
  id: number;
  confession: string;
  hash: string;
  channel?: ConfessionChannel;
  stagingTs?: string;
  state: "approved" | "rejected" | "staged" | "unstaged" = "unstaged";

  private constructor(id: number, confession: string, hash: string) {
    this.id = id;
    this.confession = confession;
    this.hash = hash;
  }

  static async create(
    confession?: string,
    slackId?: string
  ): Promise<Confession> {
    const id = await nextId();
    return new Confession(id, confession ?? "", slackId ? hash(slackId) : "");
  }

  async updateDb(): Promise<void> {
    // check if in db
  }

  async stage(): Promise<void> {
    this.stagingTs = await chatPostMessage(
      process.env.CONFESSIONS_REVIEW,
      stagingBlocks(this.id, this.confession)
    );
    this.state = "staged";
  }

  static from(params: {
    id: number;
    confession: string;
    hash: string;
    channel?: ConfessionChannel;
    stagingTs?: string;
    state: "approved" | "rejected" | "staged" | "unstaged";
  }): Confession {
    const { id, confession, hash } = params;
    const confessionObject = new Confession(id, confession, hash);
    Object.assign(confessionObject, params);
    return confessionObject;
  }
}
