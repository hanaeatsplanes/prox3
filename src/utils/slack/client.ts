import { ErrorWithStatus } from "@/models/error.ts";

export async function postMessage(
  channel: string,
  content: string | object[],
  thread?: {
    thread_ts: string;
    reply_broadcast?: true;
  }
) {
  const isText = typeof content === "string";
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      ...(isText ? { text: content } : { blocks: content }),
      ...thread,
    }),
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new ErrorWithStatus(
      `Slack rate limited. Retry after ${retryAfter || "60"} seconds`,
      500
    );
  }

  if (!response.ok) throw new Error(`Slack API error: ${response.status}`);

  const data = (await response.json()) as {
    ok: boolean;
    error?: string;
    ts: string;
  };
  if (!data.ok) throw new ErrorWithStatus(`Slack API: ${data.error}`, 500);
  return data.ts;
}

export async function chatUpdate(
  ts: string,
  channel: string,
  content: string | object[]
) {
  const isText = typeof content === "string";
  const response = await fetch("https://slack.com/api/chat.update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ts,
      channel,
      ...(isText ? { text: content } : { blocks: content }),
    }),
  });
  if (!response.ok) throw new Error(`Slack API error: ${response.status}`);

  const data = (await response.json()) as {
    ok: boolean;
    error?: string;
    ts: string;
  };
  if (!data.ok) throw new ErrorWithStatus(`Slack API: ${data.error}`, 500);
  return data.ts;
}
