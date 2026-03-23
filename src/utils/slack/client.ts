export async function chatPostMessage(
  channel: string,
  content: string | object[],
  thread?: {
    thread_ts: string;
    reply_broadcast?: true;
  }
): Promise<string> {
  const isText = typeof content === "string";
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    body: JSON.stringify({
      channel,
      ...(isText ? { text: content } : { blocks: content }),
      ...thread,
    }),
    headers: {
      Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    console.error(
      `Slack rate limited. Retry after ${retryAfter || "60"} seconds`
    );
    return "";
  }

  if (!response.ok) throw new Error(`Slack API error: ${response.status}`);

  const data = (await response.json()) as {
    ok: boolean;
    error?: string;
    ts: string;
  };
  if (!data.ok) console.error(`Slack API: ${data.error}`);
  return data.ts;
}

export async function chatUpdate(
  ts: string,
  channel: string,
  content: string | object[]
): Promise<string> {
  const isText = typeof content === "string";
  const response = await fetch("https://slack.com/api/chat.update", {
    body: JSON.stringify({
      channel,
      ts,
      ...(isText ? { blocks: [], text: content } : { blocks: content }),
    }),
    headers: {
      Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) throw new Error(`Slack API error: ${response.status}`);

  const data = (await response.json()) as {
    ok: boolean;
    error?: string;
    ts: string;
  };
  if (!data.ok) console.error(`Slack API: ${data.error}`);
  return data.ts;
}

export async function chatDelete(ts: string, channel: string): Promise<void> {
  const response = await fetch("https://slack.com/api/chat.delete", {
    body: JSON.stringify({ channel, ts }),
    headers: {
      Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) throw new Error(`Slack API error: ${response.status}`);

  const data = (await response.json()) as { ok: boolean; error?: string };
  if (!data.ok) console.error(`Slack API: ${data.error}`);
}
