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
export type EmojiSuggestPayload = typeof EmojiSuggestPayload.static;

export const SlackURLVerification = t.Object({
	challenge: t.String(),
	type: t.Literal("url_verification"),
});

export const MessageIMEvent = t.Object(
	{
		event: t.Object(
			{
				bot_id: t.Optional(t.String()),
				channel: t.String(),
				channel_type: t.Literal("im"),
				subtype: t.Optional(t.String()),
				thread_ts: t.Optional(t.String()),
				ts: t.String(),
				type: t.Literal("message"),
				user: t.String(),
			},
			{ additionalProperties: true }
		),
		type: t.Literal("event_callback"),
	},
	{ additionalProperties: true }
);

export const BlockActionEvent = t.Object(
	{
		actions: t.Array(
			t.Object(
				{
					action_id: t.String(),
				},
				{ additionalProperties: true }
			)
		),
		channel: t.Optional(
			t.Object(
				{
					id: t.String(),
				},
				{ additionalProperties: true }
			)
		),
		container: t.Object(
			{
				channel_id: t.String(),
				message_ts: t.String(),
				thread_ts: t.Optional(t.String()),
			},
			{ additionalProperties: true }
		),
		trigger_id: t.String(),
		type: t.Literal("block_actions"),
		user: t.Object(
			{
				id: t.String(),
			},
			{ additionalProperties: true }
		),
	},
	{ additionalProperties: true }
);

export const CommandBody = t.Object({
	channel_id: t.String(),
	command: t.String(),
	text: t.String(),
	user_id: t.String(),
});

export const ViewSubmissionEvent = t.Object(
	{
		type: t.Literal("view_submission"),
		user: t.Object({ id: t.String() }, { additionalProperties: true }),
		view: t.Object(
			{
				callback_id: t.Union([
					t.Literal("approve:tw"),
					t.Literal("reply_anon"),
					t.Literal("react_anon"),
				]),
				private_metadata: t.String(),
				state: t.Object(
					{
						values: t.Record(
							t.String(),
							t.Record(
								t.String(),
								t.Object(
									{
										type: t.String(),
										value: t.Optional(t.Union([t.String(), t.Null()])),
									},
									{ additionalProperties: true }
								)
							)
						),
					},
					{ additionalProperties: true }
				),
			},
			{ additionalProperties: true }
		),
	},
	{ additionalProperties: true }
);

export const ViewClosedEvent = t.Object(
	{
		type: t.Literal("view_closed"),
		user: t.Object(
			{
				id: t.String(),
			},
			{ additionalProperties: true }
		),
		view: t.Object(
			{
				callback_id: t.String(),
				private_metadata: t.String(),
			},
			{ additionalProperties: true }
		),
	},
	{ additionalProperties: true }
);

export const MessageActionEvent = t.Object(
	{
		callback_id: t.Union([t.Literal("reply_anon"), t.Literal("react_anon")]),
		channel: t.Object(
			{
				id: t.String(),
			},
			{ additionalProperties: true }
		),
		message: t.Object(
			{
				thread_ts: t.Optional(t.String()),
				ts: t.String(),
			},
			{ additionalProperties: true }
		),
		response_url: t.String(),
		trigger_id: t.String(),
		type: t.Literal("message_action"),
		user: t.Object(
			{
				id: t.String(),
			},
			{ additionalProperties: true }
		),
	},
	{ additionalProperties: true }
);

export const SlackEventBody = t.Union([
	SlackURLVerification,
	MessageIMEvent,
	BlockActionEvent,
	ViewClosedEvent,
	ViewSubmissionEvent,
	MessageActionEvent,
]);

export const EmojiSuggestPayload = t.Object(
	{
		type: t.Literal("external_select"),
		value: t.String(),
	},
	{ additionalProperties: true }
);

export const SlackInboundRequest = t.Union([SlackEventBody, CommandBody, EmojiSuggestPayload]);
