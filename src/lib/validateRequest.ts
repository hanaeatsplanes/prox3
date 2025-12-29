import crypto from "crypto";

export default function validateRequest(headers: Record<string, string | undefined>, body: unknown) {
	if (!headers['x-slack-request-timestamp']) {
		throw new Error("`X-Slack-Request-Timestamp` is missing");
	}

	const timestamp = parseInt(headers['x-slack-request-timestamp']!)

	if (Date.now() / 1000 - timestamp > 300) {
		throw new Error("`X-Slack-Request-Timestamp` is too old, reject");
	}

	if (!headers['x-slack-signature']) {
		throw new Error("`X-Slack-Signature` is missing");
	}

	const signature = headers["x-slack-signature"]

	if (!verifySlackSig(`${timestamp}`, body as string, signature)) {
		throw new Error("Invalid signature");
	}
}

function verifySlackSig(
	timestamp: string,
	body: string,
	signature: string
): boolean {
	const secret = process.env.SLACK_SIGNING_SECRET;
	if (!secret) return false;

	const baseStr = `v0:${timestamp}:${body}`;
	const hash = crypto
		.createHmac("sha256", secret)
		.update(baseStr)
		.digest("hex");

	const expected = Buffer.from(`v0=${hash}`);
	const actual = Buffer.from(signature);

	if (expected.length !== actual.length) return false;

	return crypto.timingSafeEqual(expected, actual);
}