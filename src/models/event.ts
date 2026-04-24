export type SlackURLVerification = {
	challenge: string;
	type: "url_verification";
};

type SlackEventCallback<E> = {
	event: E;
	type: "event_callback";
};

export type MessageIMEvent = SlackEventCallback<{
	type: "message";
	subtype?: string;
	channel_type: "im";
	bot_id?: string;
	text: string;
	ts: string;
	channel: string;
	thread_ts?: string;
	user: string;
}>;

export type BlockActionEvent = {
	trigger_id: string;
	actions: {
		action_id: string;
		value: string;
	}[];
	container: {
		message_ts: string;
		channel_id: string;
		thread_ts: string;
	};
	type: "block_actions";
	user: {
		id: string;
	};
};

export type CommandBody = {
	user_id: string;
	channel_id: string;
	command: string;
	text: string;
};

type ViewStateValue = {
	type: string;
	value?: string;
};

export type ViewSubmissionEvent = {
	type: "view_submission";
	team: {
		id: string;
		domain: string;
	};
	user: {
		id: string;
		username: string;
	};
	view: {
		id: string;
		type: "modal";
		title: {
			type: "plain_text";
			text: string;
		};
		blocks: unknown[];
		private_metadata: string;
		callback_id: string;
		state: {
			values: Record<string, Record<string, ViewStateValue>>;
		};
		hash: string;
		response_urls?: {
			block_id: string;
			action_id: string;
			channel_id: string;
			response_url: string;
		}[];
	};
	api_app_id: string;
	trigger_id: string;
};

export type ViewClosedEvent = {
	type: "view_closed";
	team: {
		id: string;
		domain: string;
	};
	user: {
		id: string;
		name: string;
	};
	view: {
		callback_id: string;
		id: string;
		private_metadata: string;
		type: "modal";
		title: {
			type: "plain_text";
			text: string;
		};
		blocks: unknown[];
	};
	api_app_id: string;
	is_cleared: boolean;
};
