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

  private constructor(id: number, confession: string, hash: string) {
    this.id = id;
    this.confession = confession;
    this.hash = hash;
  }

  static async create(confession?: string, slackId?: string): Promise<Confession> {
    const id = await nextId();
    return new Confession(id, confession ?? "", slackId ? hash(slackId) : "");
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
