import { fromTypes, openapi } from "@elysia/openapi";
import { Elysia, t } from "elysia";
import approveHandler from "./approve";
import confessionsHandler from "./confessions";

const protectedApi = new Elysia({
	prefix: "/api",
})
	.guard({
		headers: t.Object({
			authorization: t.String(),
		}),
	})
	.onBeforeHandle(({ headers, status }) => {
		const auth = headers.authorization;
		if (auth !== `Bearer ${process.env.API_KEY}`) {
			status(401);
			return { error: "Unauthorized" };
		}
	});

protectedApi.post("/approve", approveHandler);
protectedApi.get("/confessions", confessionsHandler, {
	query: t.Object({
		count: t.Optional(t.Number()),
		state: t.Optional(t.Union([t.Literal("approved"), t.Literal("rejected"), t.Literal("staged")])),
	}),
});

const app = new Elysia()
	.use(
		openapi({
			exclude: {
				paths: ["/slack/command", "/", "/slack/events"],
			},
			references: fromTypes(),
		})
	)
	.use(protectedApi);

export default app;
