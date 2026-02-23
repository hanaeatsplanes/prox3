import { Elysia } from "elysia";
import command from "@/command";
import events from "@/events";

const app = new Elysia();
app.use(command);
app.use(events);
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
