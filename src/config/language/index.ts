export const approvalMessage = (id: number, confession: string) => [
	{
		text: {
			text: `*${id}* ${confession}`,
			type: "mrkdwn",
		},
		type: "section",
	},
];

export const logMessage = (
	id: number,
	status: "approved" | "approved for meta" | "rejected"
) => {
	return [
		{
			text: {
				text: `Confession *#${id}* has been *${status}*`,
				type: "mrkdwn",
			},
			type: "section",
		},
	];
};

export const stagingBlocks = (id: number, confession: string) => [
	{
		text: {
			text: `(staging) *${id}* ${confession}`,
			type: "mrkdwn",
		},
		type: "section",
	},
	{
		elements: [
			{
				action_id: "approve",
				text: {
					emoji: true,
					text: ":true: Approve",
					type: "plain_text",
				},
				type: "button",
				value: "approve",
			},
			{
				action_id: "disapprove",
				text: {
					emoji: true,
					text: ":x: Reject",
					type: "plain_text",
				},
				type: "button",
				value: "disapprove",
			},
			{
				action_id: "approve:tw",
				text: {
					emoji: true,
					text: ":angerydog: Approve with TW",
					type: "plain_text",
				},
				type: "button",
				value: "approve:tw",
			},
			{
				action_id: "approve:meta",
				text: {
					emoji: true,
					text: ":office: Approve for meta",
					type: "plain_text",
				},
				type: "button",
				value: "approve:meta",
			},
		],
		type: "actions",
	},
];

export const confirmStaging = (confession: string) => [
	{
		text: {
			text: "Would you like to stage this confession?",
			type: "plain_text",
		},
		type: "section",
	},
	{
		elements: [
			{
				action_id: "stage_confession",
				style: "primary",
				text: {
					text: "Yes",
					type: "plain_text",
				},
				type: "button",
				value: confession,
			},
			{
				action_id: "do-not-stage",
				style: "danger",
				text: {
					emoji: true,
					text: "No",
					type: "plain_text",
				},
				type: "button",
				value: "do-not-stage",
			},
		],
		type: "actions",
	},
];
