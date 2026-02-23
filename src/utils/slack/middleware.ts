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
