import { type Context, Elysia } from "elysia";
import buttonPressHandler from "@/events/buttonPressHandler.ts";
import dmConfessionHandler from "@/events/dmConfessionHandler.ts";
import { ErrorWithStatus } from "@/models/error.ts";
import type {
  SlackEventCallback,
  SlackURLVerification,
} from "@/models/event.ts";
import { extractEvent, validateSlackRequest } from "@/utils/slack/middleware";

const app: Elysia = new Elysia();

app.post("/api/events", async ({ request, status }: Context) => {
  try {
    const rawBody = await validateSlackRequest(request);
    if (!rawBody) {
      status("Unauthorized");
      return JSON.stringify({ status: "unauthorized" });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType) {
      status(400);
      return JSON.stringify({ status: "no content-type" });
    }
    const body = extractEvent(rawBody, contentType);

    const { type } = body;

    if (type === "url_verification") {
      return (body as SlackURLVerification).challenge;
    }

    if (type === "event_callback") {
      const { event } = body as SlackEventCallback;
      const {
        type: eventType,
        channel_type,
        bot_id,
        text,
        ts,
        subtype,
        channel,
        thread_ts,
      } = event;
      if (
        eventType === "message" &&
        channel_type === "im" &&
        !subtype &&
        !bot_id &&
        !thread_ts
      ) {
        dmConfessionHandler(text!, channel!, ts!).catch(console.error);
      }
      return { status: "ok" };
    } else if (type === "block_actions") {
      buttonPressHandler(body).catch(console.error);
    }
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
      status(error.statusCode);
      console.error(error);
    } else if (error instanceof Error) {
      status(500);
      console.error(error);
    }
  }
});

export default app;
