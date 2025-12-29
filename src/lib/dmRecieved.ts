export default async function dmRecieved(ts: string, dmChannel: string, confession: string) {
	const res = await fetch(new Request("https://slack.com/api/chat.postMessage", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
		},
		body: JSON.stringify({
			channel: dmChannel,
			reply_broadcast: true,
			blocks: [
				{
					type: "section",
					text: {
						type: "plain_text",
						text: "Should we stage this confession? ^w^",
						emoji: true
					}
				},
				{
					type: "actions",
					elements: [
						{
							type: "button",
							text: {
								type: "plain_text",
								text: "Yes",
								emoji: true
							},
							style: "primary",
							value: `${confession}`,
							action_id: "stage-confession"
						},
						{
							type: "button",
							text: {
								type: "plain_text",
								text: "Click Me",
								emoji: true
							},
							style: "danger",
							action_id: "do-not-stage"
						}
					]
				}
			],
			thread_ts: ts
		})
	}));
	if (!res.ok) {
		throw new Error(res.statusText);
	}
}