import type { ViewSubmissionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { clearLock } from "@/utils/db/lock.ts";

type PlainTextInputValue = {
	type: "plain_text_input";
	value?: string;
};

type ApproveTwViewState = {
	tw?: {
		approve_tw_input?: PlainTextInputValue;
	};
};

type ReplyViewState = {
	reply?: {
		reply_input?: PlainTextInputValue;
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
				await clearLock(stagingTs);
				throw new Error("[view_submission] no confession found for modal");
			}

			const values = body.view.state.values as ApproveTwViewState;
			const input = values.tw?.approve_tw_input;
			const tw = input?.value;
			if (!tw) {
				await clearLock(stagingTs);
				throw new Error("[view_submission] missing TW text");
			}

			await confession.tw(body.user.id, tw.trim() || tw);
			return;
		}
		case "reply_anon": {
			const approvalTs = body.view.private_metadata.trim();
			if (!approvalTs) {
				throw new Error("[view_submission] missing approval ts");
			}
			const confession = await getConfessionBy("approval_ts", approvalTs);
			if (!confession) {
				await clearLock(approvalTs);
				throw new Error("[view_submission] no confession found for modal");
			}

			const values = body.view.state.values as ReplyViewState;
			const input = values.reply?.reply_input;
			const message = input?.value;
			if (message === undefined) {
				await clearLock(approvalTs);
				throw new Error("[view_submission] no message in modal");
			}
			await confession.reply(message);
			return;
		}
		default: {
			console.warn(`[view_submission] unhandled callback_id: ${body.view.callback_id}`);
		}
	}
}

export default viewSubmissionHandler;
