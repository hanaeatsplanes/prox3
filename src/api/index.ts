import { Elysia, t } from "elysia";
import confessionsHandler from "./confessions";
import reviewHandler from "./review.ts";

const apiKey = process.env.API_KEY;
const app = new Elysia({
	prefix: "/api",
})
	.guard({
		detail: {
			security: [{ apiAuth: [] }],
		},
	})
	.onBeforeHandle(({ headers, status }) => {
		const header = headers["authorization"]?.split(" ");
		if (!header) {
			return status(401, { error: "unauthorized" });
		}
		const auth = header[1]?.trim();
		if (!auth || auth.length !== apiKey.length) {
			return status(401, { error: "unauthorized" });
		}
		if (!crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(auth))) {
			return status(401, { error: "unauthorized" });
		}
	})
	.post("/review", ({ body, status }) => reviewHandler({ body, status }), {
		body: t.Object({
			decision: t.UnionEnum(["approve", "reject", "meta", "tw", "undo"], {
				description:
					"Review action to take: `approve` posts to #confessions, `meta` posts to #meta, `tw` approves with a trigger warning, `reject` rejects a staged confession, and `undo` reverts a previously approved/rejected confession back to staged.",
			}),
			id: t.Number({
				description: "ID of the confession to review (approve/reject/tw/meta/undo)",
				minimum: 1,
			}),
			reviewer: t.String({
				description: "Slack ID of the reviewer performing the action.",
				pattern: "^U[A-Z0-9]{8,}$",
			}),
			tw: t.Optional(
				t.String({ description: "Trigger warning text, required when decision is `tw`." })
			),
		}),
		detail: {
			description:
				"Review a confession: approve, reject, approve with trigger warning, post to meta, or undo a prior decision.",
			tags: ["confessions"],
		},
	})
	.get("/confessions", ({ query }) => confessionsHandler({ query }), {
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
