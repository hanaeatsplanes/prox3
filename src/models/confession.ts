import { password } from "bun";
import type { ConfessionChannel } from "@/config/channels";
import { stagingBlocks } from "@/config/language/staging";
import { nextId } from "@/utils/db/confession";
import { hash, verify } from "@/utils/hash";
import { chatPostMessage } from "@/utils/slack/client";

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
    confession: string,
    slackId: string
  ): Promise<Confession> {
    const id = await nextId();
    return new Confession(id, confession, hash(slackId));
  }

  sameUser(slackId: string): boolean {
    return verify(slackId, this.hash);
  }

  async updateDb(): Promise<void> {}

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
