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



export type OuterEvent = {
	token: string,
	team_id: string,
	api_app_id: string,
	event: InnerEvent,
	type: "event_callback",
	authorizations: any,
	event_context: string,
	event_id: string,
	event_time: number
}


export type InnerEvent = MessageIMInnerEvent //TODO: define properly later

export type MessageIMInnerEvent = {
	type: "message",
	channel: string,
	user: string,
	text: string,
	ts: string,
	event_ts: string,
	channel_type: "im"
}
