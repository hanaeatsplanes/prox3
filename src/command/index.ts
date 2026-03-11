import { type Context, Elysia } from "elysia";
import { Confession } from "@/models/confession.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";
import {
  extractCommandBody,
  verifySlackRequest,
} from "@/utils/slack/middleware.ts";

async function handler({ request }: Context): Promise<void> {
  const rawBody = await request.text();
  if (!(await verifySlackRequest(request, rawBody))) return;
  const { text, user_id } = extractCommandBody(rawBody);
  // todo: check for revive
  const confession = await Confession.create(text, user_id);
  await confession.stage();
  await confession.updateDB();
  await chatPostMessage(user_id, `Staged as confession ${confession.id}`);
}

export default new Elysia().post("/api/command", handler);
