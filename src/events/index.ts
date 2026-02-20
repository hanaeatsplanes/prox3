import { Elysia, type Context } from "elysia";
import { validateSlackRequest } from "@/utils";

const app = new Elysia();

app.post("/api/events", async (context: Context) => {
    const { request, } = context;
    if (!await validateSlackRequest(request)) {

    }
});

export default app;
