import { redis } from "bun";
import { Elysia } from "elysia";
import command from "@/command";
import events from "@/events";

await redis.connect();

const app = new Elysia();
app.use(command);
app.use(events);
app.get("/", "gay");

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
