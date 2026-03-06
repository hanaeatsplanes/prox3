import { type Context, Elysia } from "elysia";
import { Confession } from "@/models/confession.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";
import { extractCommandBody } from "@/utils/slack/middleware.ts";

export default new Elysia().post("/api/command", handler);

async function handler({ request }: Context): Promise<void> {
  const body = extractCommandBody(await request.text());
  const confession = await Confession.create(body.text, body.user_id);
  await confession.stage();
  await confession.updateDB();
}
