import crypto from "crypto";

export class Confession {
	id: number;
	hash: string;
	message: string;
	salt: string;

	constructor(id: number, hash: string, message: string, salt: string) {
		this.id = id;
		this.hash = hash;
		this.message = message;
		this.salt = salt;
	}

	sameUser(slackId: string): boolean {
		return crypto.scryptSync(Buffer.from(slackId), this.salt, 64).toString("hex") === this.hash
	}
}