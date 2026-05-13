import { t } from "elysia";

export type SlackURLVerification = typeof SlackURLVerification.static;
export type MessageIMEvent = typeof MessageIMEvent.static;
export type BlockActionEvent = typeof BlockActionEvent.static;
export type CommandBody = typeof CommandBody.static;
export type ViewSubmissionEvent = typeof ViewSubmissionEvent.static;
export type ViewClosedEvent = typeof ViewClosedEvent.static;
export type MessageActionEvent = typeof MessageActionEvent.static;
export type SlackEventBody = typeof SlackEventBody.static;
export type SlackInboundRequest = typeof SlackInboundRequest.static;

export const SlackURLVerification = t.Object({
	challenge: t.String(),
	type: t.Literal("url_verification"),
});

export const MessageIMEvent = t.Object({
	event: t.Object({
		bot_id: t.Optional(t.String()),
		channel: t.String(),
		channel_type: t.Literal("im"),
		subtype: t.Optional(t.String()),
		text: t.String(),
		thread_ts: t.Optional(t.String()),
		ts: t.String(),
		type: t.Literal("message"),
		user: t.String(),
	}),
	type: t.Literal("event_callback"),
});

export const BlockActionEvent = t.Object({
	actions: t.Array(
		t.Object({
			action_id: t.String(),
			value: t.String(),
		})
	),
	channel: t.Optional(
		t.Object({
			id: t.String(),
		})
	),
	container: t.Object({
		channel_id: t.Optional(t.String()),
		message_ts: t.String(),
		thread_ts: t.Optional(t.String()),
	}),
	message: t.Object({
		text: t.String(),
		ts: t.String(),
	}),
	trigger_id: t.String(),
	type: t.Literal("block_actions"),
	user: t.Object({
		id: t.String(),
	}),
});

export const CommandBody = t.Object({
	channel_id: t.String(),
	command: t.String(),
	text: t.String(),
	user_id: t.String(),
});

const viewStateValue = t.Object({
	type: t.String(),
	value: t.Optional(t.String()),
});

export const ViewSubmissionEvent = t.Object({
	api_app_id: t.String(),
	enterprise: t.Optional(
		t.Object({
			id: t.String(),
			name: t.String(),
		})
	),
	is_enterprise_install: t.Boolean(),
	response_urls: t.Array(t.Unknown()),
	team: t.Object({
		domain: t.String(),
		enterprise_id: t.Optional(t.String()),
		enterprise_name: t.Optional(t.String()),
		id: t.String(),
	}),
	token: t.String(),
	trigger_id: t.String(),
	type: t.Literal("view_submission"),
	user: t.Object({
		id: t.String(),
		name: t.Optional(t.String()),
		team_id: t.Optional(t.String()),
		username: t.String(),
	}),
	view: t.Object({
		app_id: t.Optional(t.String()),
		app_installed_team_id: t.Optional(t.String()),
		blocks: t.Array(t.Unknown()),
		bot_id: t.Optional(t.String()),
		callback_id: t.Union([t.Literal("approve:tw"), t.Literal("reply_anon"), t.Literal("react_anon")]),
		clear_on_close: t.Optional(t.Boolean()),
		close: t.Optional(t.Unknown()),
		external_id: t.Optional(t.String()),
		hash: t.String(),
		id: t.String(),
		notify_on_close: t.Optional(t.Boolean()),
		previous_view_id: t.Optional(t.String()),
		private_metadata: t.String(),
		response_urls: t.Array(t.Unknown()),
		root_view_id: t.Optional(t.String()),
		state: t.Object({
			values: t.Record(t.String(), t.Record(t.String(), viewStateValue)),
		}),
		submit: t.Optional(t.Unknown()),
		team_id: t.Optional(t.String()),
		title: t.Object({
			text: t.String(),
			type: t.Literal("plain_text"),
		}),
		type: t.Literal("modal"),
	}),
});

export const ViewClosedEvent = t.Object({
	api_app_id: t.String(),
	enterprise: t.Optional(
		t.Object({
			id: t.String(),
			name: t.String(),
		})
	),
	is_cleared: t.Boolean(),
	is_enterprise_install: t.Boolean(),
	team: t.Object({
		domain: t.String(),
		enterprise_id: t.Optional(t.String()),
		enterprise_name: t.Optional(t.String()),
		id: t.String(),
	}),
	token: t.String(),
	type: t.Literal("view_closed"),
	user: t.Object({
		id: t.String(),
		name: t.Optional(t.String()),
		team_id: t.Optional(t.String()),
		username: t.String(),
	}),
	view: t.Object({
		app_id: t.Optional(t.String()),
		app_installed_team_id: t.Optional(t.String()),
		blocks: t.Array(t.Unknown()),
		bot_id: t.Optional(t.String()),
		callback_id: t.String(),
		clear_on_close: t.Optional(t.Boolean()),
		close: t.Optional(t.Unknown()),
		external_id: t.Optional(t.String()),
		id: t.String(),
		notify_on_close: t.Optional(t.Boolean()),
		previous_view_id: t.Optional(t.String()),
		private_metadata: t.String(),
		response_urls: t.Optional(t.Array(t.Unknown())),
		root_view_id: t.Optional(t.String()),
		state: t.Optional(
			t.Object({
				values: t.Record(t.String(), t.Record(t.String(), viewStateValue)),
			})
		),
		submit: t.Optional(t.Unknown()),
		team_id: t.Optional(t.String()),
		title: t.Object({
			text: t.String(),
			type: t.Literal("plain_text"),
		}),
		type: t.Literal("modal"),
	}),
});

export const MessageActionEvent = t.Object({
	callback_id: t.Union([t.Literal("reply_anon"), t.Literal("react_anon")]),
	channel: t.Object({
		id: t.String(),
		name: t.String(),
	}),
	message: t.Object({
		bot_profile: t.Optional(
			t.Object({
				id: t.String(),
			})
		),
		text: t.String(),
		thread_ts: t.Optional(t.String()),
		ts: t.String(),
		type: t.Literal("message"),
		user: t.String(),
	}),
	response_url: t.String(),
	team: t.Object({
		domain: t.String(),
		id: t.String(),
	}),
	token: t.String(),
	trigger_id: t.String(),
	type: t.Literal("message_action"),
	user: t.Object({
		id: t.String(),
		name: t.String(),
	}),
});

export const SlackEventBody = t.Union([
	SlackURLVerification,
	MessageIMEvent,
	BlockActionEvent,
	ViewClosedEvent,
	ViewSubmissionEvent,
	MessageActionEvent,
]);

export const SlackInboundRequest = t.Union([SlackEventBody, CommandBody]);
