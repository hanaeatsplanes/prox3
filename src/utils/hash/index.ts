import { password } from "bun";

export function hash(slackId: string): string {
  return password.hashSync(slackId);
}

export function verify(slackId: string, hash: string): boolean {
  return password.verifySync(slackId, hash);
}

