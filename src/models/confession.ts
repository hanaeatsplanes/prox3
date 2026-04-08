import { stagingBlocks } from "@/config/language/staging.ts";
import type { ConfessionChannel } from "@/models/channels.ts";
import { nextId, putConfession } from "@/utils/db/confession";
import { hash, verify } from "@/utils/hash";
import { chatPostMessage } from "@/utils/slack/client";
import { sanitizeMessage } from "@/utils/slack/middleware.ts";

type ConfessionState = "approved" | "rejected" | "staged" | "unstaged";

export class Confession {
	id: number;
	confession: string;
	hash: string;
	channel?: ConfessionChannel;
	stagingTs?: string;
	approvalTs?: string;
	state: ConfessionState = "unstaged";

	private constructor(id: number, confession: string, hash: string) {
		this.id = id;
		this.confession = sanitizeMessage(confession);
		this.hash = hash;
	}

	static async create(confession: string, slackId: string) {
		const id = await nextId();
		return new Confession(id, confession, hash(slackId));
	}

	sameUser(slackId: string) {
		return verify(slackId, this.hash);
	}

	async updateDB() {
		await putConfession(this);
	}

	static from(params: {
		id: number;
		confession: string;
		hash: string;
		channel?: ConfessionChannel;
		stagingTs?: string;
		approvalTs?: string;
		state: ConfessionState;
	}) {
		const { id, confession, hash } = params;
		const confessionObject = new Confession(id, confession, hash);
		Object.assign(confessionObject, params);
		return confessionObject;
	}

	async stage() {
		this.stagingTs = await chatPostMessage(
			process.env.CONFESSIONS_REVIEW,
			stagingBlocks(this.id, this.confession)
		);
		this.state = "staged";
		await this.updateDB();
	}
}
