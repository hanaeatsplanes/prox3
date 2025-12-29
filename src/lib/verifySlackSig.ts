import crypto from "crypto";

export default function verifySlackSig(
	timestamp: string,
	body: string,
	signature: string
) {

	const baseStr = `v0:${timestamp}:${body}`;

	const hash = crypto
		.createHmac("sha256", process.env.SLACK_SIGNING_SECRET)
		.update(baseStr)
		.digest("hex");

	return crypto.timingSafeEqual(
		Buffer.from(`v0=${hash}`),
		Buffer.from(signature)
	)
}