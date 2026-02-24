import type { ConfessionChannel } from "@/config/channels";
import { hash } from "@/utils/hash";

export class Confession {
  id: number;
  message: string;
  hash: string;
  channel?: ConfessionChannel;
  stagingTs?: string;
  state: "approved" | "rejected" | "staged" = "staged";

  constructor(id: number, message: string, slackId: string) {
    this.id = id;
    this.message = message;
    this.hash = hash(slackId);
  }
}
