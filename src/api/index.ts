import { Elysia, t } from "elysia";
import confessionsHandler from "./confessions";
import reviewHandler from "./review.ts";

const app = new Elysia({
	prefix: "/api",
})
	.guard({
		headers: t.Object({
			authorization: t.String({
				description: "API Key - DM @hna for one! Only for CRT.",
			}),
		}),
	})
	.onBeforeHandle(({ headers, status }) => {
		const auth = headers.authorization;
		if (auth !== `Bearer ${process.env.API_KEY}`) {
			return status(401, { error: "unauthorized" });
		}
	});

app.post("/review", reviewHandler, {
	body: t.Object({
		decision: t.UnionEnum(["approve", "reject", "approve:meta", "approve:tw"]),
		id: t.Number({
			description: "ID of the confession to approve",
			minimum: 1,
		}),
		reviewer: t.String({
			description: "Slack ID of the reviewer approving the confession.",
			pattern: "^U[A-Z0-9]{8,}$",
		}),
		tw: t.Optional(t.String()),
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
			t.UnionEnum(["approved", "rejected", "staged"], {
				description: "Filter confessions by approval state",
			})
		),
	}),
});

export default app;
