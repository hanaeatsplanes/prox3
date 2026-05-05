import { getConfessionBy } from "@/utils/db/confession.ts";

export default async function ({
	body: { id, reviewer, decision, tw },
	status,
}: {
	body: {
		id: number;
		reviewer: string;
		decision: "approve" | "approve:meta" | "approve:tw" | "reject";
		tw?: string;
	};
	status: (arg0: number, arg1?: string) => unknown;
}) {
	const confession = await getConfessionBy("id", id);
	if (!confession) {
		status(400);
		return { error: `Confession with ID ${id} not found`, status: "error" };
	}
	switch (decision) {
		case "approve":
			await confession.approve(process.env.CONFESSIONS, reviewer);
			return {
				approvalTs: confession.approvalTs,
				channel: confession.channel,
				status: "success",
			};
		case "approve:meta":
			await confession.approve(process.env.META, reviewer);
			return {
				approvalTs: confession.approvalTs,
				channel: confession.channel,
				status: "success",
			};
		case "approve:tw":
			if (!tw) {
				return {
					error: "tw needed if approving with tw",
					status: "error",
				};
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
	}
}
