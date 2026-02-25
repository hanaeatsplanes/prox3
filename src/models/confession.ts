import type { ConfessionChannel } from "@/config/channels";
import { nextId } from "@/utils/db/confession.ts";
import { hash } from "@/utils/hash";
import { chatPostMessage } from "@/utils/slack/client.ts";

const blocks = (id: number, confession: string) => `${id}: ${confession}`;

export class Confession {
  id: number;
  confession: string;
  hash: string;
  channel?: ConfessionChannel;
  stagingTs?: string;
  state: "approved" | "rejected" | "staged" | "unstaged" = "unstaged";

  constructor(confession?: string, slackId?: string) {
    this.id = nextId();
    this.confession = confession ?? "";
    this.hash = slackId ? hash(slackId) : "";
  }

  async stage(): Promise<void> {
    this.state = "staged";
    this.stagingTs = await chatPostMessage(
      process.env.CONFESSIONS_REVIEW,
      blocks(this.id, this.confession)
    );
  }

  static from(id: number): Confession {}
}
