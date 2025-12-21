import crypto from "crypto";

export default function stageConfession(message: string, slackId: string) {
	const salt = crypto.randomBytes(16).toString("hex"); // stolen from ani

	const hash = crypto.scryptSync(Buffer.from(slackId), salt, 64).toString("hex");
}