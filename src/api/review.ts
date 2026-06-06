import type { status as typeStatus } from "elysia";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { acquireLock, releaseLock } from "@/utils/db/lock.ts";

export default async function ({
	body: { id, reviewer, decision, tw },
	status,
}: {
	body: {
		id: number;
		reviewer: string;
		decision: "approve" | "meta" | "tw" | "reject" | "undo";
		tw?: string;
	};
	status: typeof typeStatus;
}) {
	const confession = await getConfessionBy("id", id);
	if (!confession) {
		return status(400, { error: `Confession with ID ${id} not found`, status: "error" });
	}
	if ((confession.state === "staged") === (decision === "undo")) {
		return status(409, { error: `Confession with ID ${id} is ${confession.state}`, status: "error" });
	}
	const { stagingTs } = confession;
	if (!stagingTs) {
		return status(409, {
			error: `Confession with ID ${id} is missing staging data`,
			status: "error",
		});
	}
	if (!(await acquireLock(stagingTs))) {
		return status(409, {
			error: `Confession with ID ${id} is being acted upon, please try again later.`,
			status: "error",
		});
	}
	try {
		switch (decision) {
			case "approve":
				await confession.approve(process.env.CONFESSIONS, reviewer);
				return {
					approvalTs: confession.approvalTs,
					channel: confession.channel,
					status: "success",
				};
			case "meta":
				await confession.approve(process.env.META, reviewer);
				return {
					approvalTs: confession.approvalTs,
					channel: confession.channel,
					status: "success",
				};
			case "tw":
				if (!tw) {
					return status(400, {
						error: "tw needed if approving with tw",
						status: "error",
					});
				}
				await confession.tw(reviewer, tw);
				return {
					approvalTs: confession.approvalTs,
					channel: confession.channel,
					status: "success",
				};
			case "reject":
				await confession.reject(reviewer);
				return {
					status: "success",
				};
			case "undo":
				await confession.undo(reviewer);
				return {
					status: "success",
				};
		}
	} finally {
		await releaseLock(stagingTs);
	}
}
