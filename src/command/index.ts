import { Elysia } from "elysia";

const app: Elysia = new Elysia();

app.post("/api/command", () => {
  // command handler
});

export default app;
