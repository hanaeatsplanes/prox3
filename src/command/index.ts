import { Elysia } from "elysia"

const app = new Elysia()

app.post("/api/command", () => {
  // command handler
})

export default app
