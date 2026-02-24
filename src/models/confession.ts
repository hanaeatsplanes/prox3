import type { ConfessionChannel } from "@/config/channels";

export class Confession {
  id: number;
  message: string;
  hash: string;
  salt: string;
  channel?: ConfessionChannel;
  stagingTs?: string;
  state: "approved" | "rejected" | "staged" = "staged";

  constructor(id: number, message: string, slackId: string) {
    this.id = id;
    this.message = message;
  }

  static from(confession: {
    id: number;
    message: string;
    hash: string;
    salt: string;
    channel?: ConfessionChannel;
    stagingTs?: string;
    state?: "approved" | "rejected" | "staged";
  }) {
    Object.assign(
      new Confession(confession.id, confession.message, ""),
      confession
    );
  }
}
