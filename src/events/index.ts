import { type Context, Elysia } from "elysia";
import buttonPressHandler from "@/events/buttonPressHandler.ts";
import dmConfessionHandler from "@/events/dmConfessionHandler.ts";
import type { MessageIMEvent, SlackURLVerification } from "@/models/event.ts";
import { extractEvent, parseWithVerification } from "@/utils/slack/middleware";

export default new Elysia().post("/api/events", handler);

async function handler({
  request,
}: Context): Promise<{ status: string; error?: string } | string> {
  try {
    const contentType = request.headers.get("content-type");
    const rawBody = await parseWithVerification(request);
    if (!contentType || !rawBody) {
      return { status: "error", error: "missing body or content-type" };
    }

    const body = extractEvent(rawBody, contentType);

    const { type } = body;

    if (type === "url_verification") {
      return (body as SlackURLVerification).challenge;
    }

    if (type === "event_callback") {
      const { event } = body as MessageIMEvent;
      if (
        event.type === "message" &&
        event.channel_type === "im" &&
        !event.subtype &&
        !event.bot_id &&
        !event.thread_ts
      ) {
        dmConfessionHandler(event.text, event.channel, event.ts).catch(
          console.error
        );
      }
    } else if (type === "block_actions") {
      buttonPressHandler(body).catch(console.error);
    }
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
  return { status: "ok" };
}
