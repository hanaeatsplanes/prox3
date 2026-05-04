import type { ViewClosedEvent } from "@/models/event.ts";
import { clearLock } from "@/utils/db/lock.ts";

export default async function viewClosedHandler(body: ViewClosedEvent) {
	switch (body.view.callback_id) {
		case "approve:tw": {
			const stagingTs = body.view.private_metadata.trim();
			if (!stagingTs) {
				return;
			}

			try {
				return await clearLock(stagingTs);
			} catch (error) {
				console.error(
					`[events] failed to delete action cache cache:${stagingTs}`,
					error
				);
			}
		}
	}
}
