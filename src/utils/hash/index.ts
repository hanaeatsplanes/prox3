import { password } from "bun";

const pepper = process.env.HASH_PEPPER ?? "";

export function hash(slackId: string) {
	return password.hashSync(slackId + pepper);
}

export function verify(slackId: string, hash: string) {
	return password.verifySync(slackId + pepper, hash);
}
