import { Elysia, t } from "elysia";
import approveHandler from "./approve";
import confessionsHandler from "./confessions";

const app = new Elysia({
	prefix: "/api",
})
	.guard({
		headers: t.Object({
			Authorization: t.String({
				description: "API Key - DM @hna for one! Only for CRT.",
			}),
		}),
	})
	.onBeforeHandle(({ headers, status }) => {
		const auth = headers.Authorization;
		if (auth !== `Bearer ${process.env.API_KEY}`) {
			status(401);
			return { error: "Unauthorized" };
		}
	});

app.post("/approve", approveHandler, {
	body: t.Object({
		confessionId: t.Number({
			description: "ID of the confession to approve",
			minimum: 1,
		}),
		reviewer: t.String({
			description: "Slack ID of the reviewer approving the confession.",
			pattern: "^U[A-Z0-9]{8,}$",
		}),
	}),
	detail: {
		description: "Approve a staged confession",
		tags: ["confessions"],
	},
});
app.get("/confessions", confessionsHandler, {
	detail: {
		description: "Retrieve confessions by state",
		tags: ["confessions"],
	},
	query: t.Object({
		count: t.Optional(
			t.Number({
				description: "Maximum number of confessions to return",
			})
		),
		state: t.Optional(
			t.Union([t.Literal("approved"), t.Literal("rejected"), t.Literal("staged")], {
				description: "Filter confessions by approval state",
			})
		),
	}),
});

export default app;
