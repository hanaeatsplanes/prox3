export const approvalBlocks = (id: number) => [
	{
		text: {
			text: `Confession *#${id}* has been *approved.*`,
			type: "mrkdwn",
		},
		type: "section",
	},
];
