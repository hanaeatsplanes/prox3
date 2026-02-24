import { password } from "bun";

export async function hash(slackId: string) {
  return password.hashSync(slackId);
}

export async function verify(slackId: string, hash: string) {
  return password.verifySync(slackId, hash);
}
