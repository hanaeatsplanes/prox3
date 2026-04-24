import type { ViewClosedEvent } from "@/models/event.ts";
import { clearCache } from "@/utils/db/cache.ts";

export default async function viewClosedHandler(body: ViewClosedEvent) {
	if (body.view.callback_id !== "approve:tw") {
		return;
	}

	const stagingTs = body.view.private_metadata.trim();
	if (!stagingTs) {
		return;
	}

	try {
		return await clearCache(stagingTs);
	} catch (error) {
		console.error(
			`[events] failed to delete staging cache cache:${stagingTs}`,
			error
		);
	}
}
