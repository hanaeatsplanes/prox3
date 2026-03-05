import { CryptoHasher } from "bun";
import type {
  BlockActionEvent,
  CommandBody,
  MessageIMEvent,
  SlackURLVerification,
} from "@/models/event.ts";

export async function parseWithVerification(
  request: Request
): Promise<string | false> {
  const timestamp = request.headers.get("X-Slack-Request-Timestamp");
  const slackSignature = request.headers.get("X-Slack-Signature");

  if (!timestamp || !slackSignature) return false;

  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

  const body = await request.text();
  const baseString = `v0:${timestamp}:${body}`;

  const hasher = new CryptoHasher("sha256", process.env.SLACK_SIGNING_SECRET);

  hasher.update(baseString);

  const signature = `v0=${hasher.digest("hex")}`;
  const valid = crypto.timingSafeEqual(
    Buffer.from(slackSignature),
    Buffer.from(signature)
  );
  return valid ? body : false;
}

export function extractEvent(
  rawBody: string,
  contentType: string
): MessageIMEvent | BlockActionEvent | SlackURLVerification {
  if (contentType?.includes("application/json")) {
    return JSON.parse(rawBody) as MessageIMEvent | SlackURLVerification;
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(rawBody);
    const payload = params.get("payload");
    if (!payload) {
      throw new Error("no payload in application/x-www-form-urlencoded");
    }
    return JSON.parse(payload) as BlockActionEvent;
  }
  throw new Error("not able to parse");
}

export function extractCommandBody(rawBody: string): CommandBody {
  const params = new URLSearchParams(rawBody);
  return Object.fromEntries(params.entries()) as CommandBody;
}

export function sanitizeMessage(message: string): string {
  return message
    .replaceAll(/<@[A-Z0-9]+\|([^>]+)>/g, "<@redacted>") //person
    .replaceAll(/<!subteam\^[A-Z0-9]+(\|([^>]+))?>/g, "<@redacted>") //pg
    .replaceAll(/<!(channel|here|everyone)>/g, ""); //chanael
}
