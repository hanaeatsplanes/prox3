export const approvalMessage = (id: number, confession: string) => [
	{
		text: {
			text: `*${id}* ${confession}`,
			type: "mrkdwn",
		},
		type: "section",
	},
];
