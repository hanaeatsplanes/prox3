import type { ViewSubmissionEvent } from "@/models/event.ts";
import { clearCache } from "@/utils/db/cache.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";

type PlainTextInputValue = {
	type: "plain_text_input";
	value?: string;
};

type ApproveTwViewState = {
	tw?: {
		approve_tw_input?: PlainTextInputValue;
	};
};

async function viewSubmissionHandler(body: ViewSubmissionEvent) {
	switch (body.view.callback_id) {
		case "approve:tw": {
			const stagingTs = body.view.private_metadata.trim();
			if (!stagingTs) {
				throw new Error("[view_submission] missing staging ts");
			}

			const confession = await getConfessionBy("staging_ts", stagingTs);
			if (!confession) {
				await clearCache(stagingTs);
				throw new Error("[view_submission] no confession found for modal");
			}

			const values = body.view.state.values as ApproveTwViewState;
			const input = values.tw?.approve_tw_input;
			const tw = input?.value;
			if (!tw) {
				await clearCache(stagingTs);
				throw new Error("[view_submission] missing TW text");
			}

			await confession.tw(body.user.id, tw.trim() || tw);
			return;
		}
		default: {
			console.warn(
				`[view_submission] unhandled callback_id: ${body.view.callback_id}`
			);
		}
	}
}

export default viewSubmissionHandler;
