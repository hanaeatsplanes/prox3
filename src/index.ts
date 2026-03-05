import { redis } from "bun";
import { Elysia } from "elysia";
import command from "@/command";
import events from "@/events";

await redis.connect();

new Elysia()
  .use(command)
  .use(events)
  .get("/", "gay")
  .listen(3000, () => {
    console.log("Listening on port 3000");
  });
