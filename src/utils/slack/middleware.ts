import { ErrorWithStatus } from "@/models/error.ts";
import type { ButtonPressBody } from "@/models/event.ts";

export async function validateSlackRequest(
  request: Request
): Promise<string | false> {
  const timestamp = request.headers.get("X-Slack-Request-Timestamp");
  const slackSignature = request.headers.get("X-Slack-Signature");

  if (!timestamp || !slackSignature) return false;

  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

  const body = await request.text();
  const baseString = `v0:${timestamp}:${body}`;

  const hasher = new Bun.CryptoHasher(
    "sha256",
    process.env.SLACK_SIGNING_SECRET
  );

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
): ButtonPressBody {
  if (contentType?.includes("application/json")) {
    return JSON.parse(rawBody);
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(rawBody);
    const payload = params.get("payload");
    if (!payload) {
      throw new ErrorWithStatus(
        "no payload in application/x-www-form-urlencoded",
        400
      );
    }
    return JSON.parse(payload) as ButtonPressBody;
  }
  throw new ErrorWithStatus("not able to parse", 400);
}

