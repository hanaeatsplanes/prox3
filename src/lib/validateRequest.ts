import verifySlackSig from "@/lib/verifySlackSig";

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