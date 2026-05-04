import { fromTypes, openapi } from "@elysia/openapi";
import { Elysia, t } from "elysia";
import approveHandler from "./approve";
import confessionsHandler from "./confessions";

const app = new Elysia({
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
	})
	.use(
		openapi({
			references: fromTypes(),
		})
	);
app.post("/approve", approveHandler);
app.get("/confessions", confessionsHandler);
export default app;
