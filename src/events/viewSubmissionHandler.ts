import type { ViewSubmissionEvent } from "@/models/event.ts";
import { getConfessionBy } from "@/utils/db/confession.ts";
import { toggleReaction } from "@/utils/slack/middleware.ts";

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

type ReactViewState = {
	react?: {
		react_input?: PlainTextInputValue;
	};
};

async function viewSubmissionHandler(body: ViewSubmissionEvent) {
	try {
		switch (body.view.callback_id) {
			case "approve:tw": {
				const stagingTs = body.view.private_metadata.trim();
				console.log(`[view_submission] approve:tw: stagingTs=${stagingTs}`);
				if (!stagingTs) {
					throw new Error("missing staging timestamp");
				}

				const confession = await getConfessionBy("staging_ts", stagingTs);
				console.log(`[view_submission] approve:tw: confession found=${!!confession}`);
				if (!confession) {
					throw new Error("confession not found");
				}

				const values = body.view.state.values as ApproveTwViewState;
				console.log(`[view_submission] approve:tw: values=${JSON.stringify(values)}`);
				const input = values.tw?.approve_tw_input;
				const tw = input?.value;
				console.log(`[view_submission] approve:tw: tw=${tw}`);
				if (!tw) {
					throw new Error("trigger warning text not provided");
				}

				await confession.tw(body.user.id, tw.trim() || tw);
				return;
			}
			case "reply_anon": {
				const approvalTs = body.view.private_metadata.trim();
				if (!approvalTs) {
					throw new Error("missing approval timestamp");
				}
				const confession = await getConfessionBy("approval_ts", approvalTs);
				if (!confession) {
					throw new Error("confession not found");
				}

				const values = body.view.state.values as ReplyViewState;
				const input = values.reply?.reply_input;
				const message = input?.value;
				if (message === undefined) {
					throw new Error("reply message not provided");
				}
				await confession.reply(message);
				return;
			}
			case "react_anon": {
				const { approvalTs, channel, reactionTs } = JSON.parse(atob(body.view.private_metadata.trim()));
				if (!approvalTs) {
					throw new Error("missing approval timestamp");
				}
				const confession = await getConfessionBy("approval_ts", approvalTs);
				if (!confession) {
					throw new Error("confession not found");
				}
				const values = body.view.state.values as ReactViewState;
				const input = values.react?.react_input;
				const emoji = input?.value;
				if (!emoji) {
					throw new Error("emoji not provided");
				}
				await toggleReaction(channel, emoji, reactionTs);
				return;
			}
			default: {
				console.warn(`[view_submission] unhandled callback_id: ${body.view.callback_id}`);
			}
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "unknown error";
		throw new Error(`approve modal failed: ${message}`);
	}
}

export default viewSubmissionHandler;
