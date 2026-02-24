import { password } from "bun";

export function hash(slackId: string) {
  return password.hashSync(slackId);
}

export function verify(slackId: string, hash: string) {
  return password.verifySync(slackId, hash);
}
