import type {
	ConversationRepliesResponse,
	SlackApiResponse,
} from "@/models/slack";

const headers = {
	Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
	"Content-Type": "application/json",
};

async function slackFetch(
	url: string,
	options: RequestInit,
	endpoint: string
): Promise<Response> {
	let attempt = 0;
	const maxRetries = 3;

	while (attempt <= maxRetries) {
		const response = await fetch(url, options);

		if (response.status === 429) {
			const retryAfter = parseInt(response.headers.get("Retry-After") || "1", 10);
			if (attempt < maxRetries) {
				const backoffMs = (retryAfter + 2 ** attempt) * 1000;
				console.warn(
					`[slack] ${endpoint} rate limited, retrying after ${backoffMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`
				);
				await new Promise((resolve) => setTimeout(resolve, backoffMs));
				attempt++;
			} else {
				return response;
			}
		} else {
			return response;
		}
	}

	throw new Error(
		`[slack] ${endpoint} rate limit exceeded after ${maxRetries} retries`
	);
}

async function readSlackResponse(response: Response, operation: string) {
	if (response.status === 429) {
		const retryAfter = response.headers.get("Retry-After") || "60";
		throw new Error(
			`[slack] ${operation} rate limited, retry after ${retryAfter}s`
		);
	}

	if (!response.ok) {
		throw new Error(`[slack] ${operation} HTTP ${response.status}`);
	}

	const data = (await response.json()) as SlackApiResponse;
	if (!data.ok) {
		throw new Error(
			`[slack] ${operation} error: ${data.error || "unknown_error"}`
		);
	}

	return data;
}

export async function chatPostMessage(
	channel: string,
	content: string | object[],
	thread?: {
		thread_ts: string;
		reply_broadcast?: true;
	}
) {
	const isText = typeof content === "string";
	const response = await slackFetch(
		"https://slack.com/api/chat.postMessage",
		{
			body: JSON.stringify({
				channel,
				...(isText ? { text: content } : { blocks: content }),
				...thread,
			}),
			headers: headers,
			method: "POST",
		},
		"chat.postMessage"
	);
	const data = await readSlackResponse(response, "chat.postMessage");
	if (!data.ts) {
		throw new Error("[slack] chat.postMessage response missing ts");
	}

	return data.ts;
}

export async function chatUpdate(
	ts: string,
	channel: string,
	content: string | object[]
) {
	const isText = typeof content === "string";
	const response = await slackFetch(
		"https://slack.com/api/chat.update",
		{
			body: JSON.stringify({
				channel,
				ts,
				...(isText ? { blocks: [], text: content } : { blocks: content }),
			}),
			headers: headers,
			method: "POST",
		},
		"chat.update"
	);
	const data = await readSlackResponse(response, "chat.update");
	if (!data.ts) {
		throw new Error("[slack] chat.update response missing ts");
	}

	return data.ts;
}

export async function chatDelete(ts: string, channel: string) {
	const response = await slackFetch(
		"https://slack.com/api/chat.delete",
		{
			body: JSON.stringify({ channel, ts }),
			headers: headers,
			method: "POST",
		},
		"chat.delete"
	);
	await readSlackResponse(response, "chat.delete");
}

export async function conversationsReplies(
	channel: string,
	threadTs: string,
	cursor?: string
): Promise<ConversationRepliesResponse> {
	const response = await slackFetch(
		`https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTs}&limit=10${cursor ? `&cursor=${cursor}` : ""}`,
		{
			headers: headers,
		},
		"conversations.replies"
	);

	if (!response.ok) {
		throw new Error(`[slack] conversations.replies HTTP ${response.status}`);
	}

	return (await response.json()) as ConversationRepliesResponse;
}

export async function chatPostEphemeral(
	channel: string,
	user: string,
	text: string
) {
	const response = await slackFetch(
		"https://slack.com/api/chat.postEphemeral",
		{
			body: JSON.stringify({ channel, markdown_text: text, user }),
			headers: headers,
			method: "POST",
		},
		"chat.postEphemeral"
	);
	return response.ok;
}

export async function viewsOpen(triggerId: string, view: object) {
	const response = await slackFetch(
		"https://slack.com/api/views.open",
		{
			body: JSON.stringify({ trigger_id: triggerId, view }),
			headers: headers,
			method: "POST",
		},
		"views.open"
	);
	await readSlackResponse(response, "views.open");
}
