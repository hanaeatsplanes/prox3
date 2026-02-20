import { type Context, Elysia } from "elysia"
import { validateSlackRequest } from "@/utils"

const app = new Elysia()

app.post("/api/events", async ({ request, status }: Context) => {
  const rawBody = await validateSlackRequest(request)
  if (!rawBody) {
    status("Unauthorized")
    return JSON.stringify({ status: "unauthorized" })
  }

  const body = JSON.parse(rawBody)

  const { type } = body
  if (type === "url_verification") {
    return body.challenge
  }
})

export default app
