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
