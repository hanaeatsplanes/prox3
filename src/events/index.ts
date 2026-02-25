import { type Context, Elysia } from "elysia";
import dmConfessionHandler from "@/events/dmConfessionHandler.ts";
import { ErrorWithStatus } from "@/models/error.ts";
import { extractEvent, validateSlackRequest } from "@/utils/slack/middleware";

const app = new Elysia();

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
      return body.challenge;
    }

    if (type === "event_callback") {
      const { event } = body;
      if (
        event.type === "message" &&
        event.channel_type === "im" &&
        !event.bot_id
      ) {
        const confession = event.text;
        dmConfessionHandler(confession, event.channel, event.ts).catch(
          console.error
        );
      }
      return { status: "ok" };
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
