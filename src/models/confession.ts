import type { ConfessionChannel } from "@/config/channels";

export class Confession {
  id: number;
  message: string;
  hash: string;
  salt: string;
  channel?: ConfessionChannel;
  stagingTs?: string;
  state: "approved" | "rejected" | "staged" = "staged";

  constructor(
    id: number,
    message: string,
    channel?: ConfessionChannel
  );
  constructor(confession: {
    id: number;
    message: string;
    hash: string;
    salt: string;
    channel?: ConfessionChannel;
    stagingTs?: string;
    state?: "approved" | "rejected" | "staged";
  });
  constructor(
    id: number | object,
    message?: string,
    channel?: ConfessionChannel
  ) {
    if (typeof id === "number") {
      this.id = id;
      this.message = message!;
      if (channel) this.channel = channel;
    } else {
      Object.assign(this, id);
    }
  }
}
