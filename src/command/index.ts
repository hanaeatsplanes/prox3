import { type Context, Elysia } from "elysia";
import { Confession } from "@/models/confession.ts";
import { chatPostMessage } from "@/utils/slack/client.ts";
import { extractCommandBody } from "@/utils/slack/middleware.ts";

export default new Elysia().post("/api/command", handler);

async function handler({ request }: Context): Promise<void> {
  const { text, user_id } = extractCommandBody(await request.text());
  // todo: check for revive
  const confession = await Confession.create(text, user_id);
  await confession.stage();
  await confession.updateDB();
  await chatPostMessage(user_id, `Staged as confession ${confession.id}`);
}
