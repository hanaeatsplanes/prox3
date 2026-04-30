import {
	approvalMessage,
	logMessage,
	reviewedMessage,
	stagingMessage,
	undoneConfession,
} from "@/config/language/index.ts";
import type { ConfessionChannel } from "@/models/channels.ts";
import { nextId, putConfession } from "@/utils/db/confession.ts";
import { hash, verify } from "@/utils/hash";
import {
	chatDelete,
	chatPostMessage,
	chatUpdate,
} from "@/utils/slack/client.ts";
import { getAllMyMessages, sanitizeMessage } from "@/utils/slack/middleware.ts";

type ConfessionState = "approved" | "rejected" | "staged" | "unstaged";

export class Confession {
	id: number;
	confession: string;
	hash: string;
	channel?: ConfessionChannel;
	stagingTs?: string;
	approvalTs?: string;
	state: ConfessionState = "unstaged";
	reviewer?: string;

	private constructor(id: number, confession: string, hash: string) {
		this.id = id;
		this.confession = sanitizeMessage(confession);
		this.hash = hash;
	}

	static async create(confession: string, slackId: string) {
		const id = await nextId();
		return new Confession(id, confession, hash(slackId));
	}

	static from(params: {
		id: number;
		confession: string;
		hash: string;
		channel?: ConfessionChannel;
		stagingTs?: string;
		approvalTs?: string;
		state: ConfessionState;
		reviewer?: string;
	}) {
		const { id, confession, hash } = params;
		const confessionObject = new Confession(id, confession, hash);
		Object.assign(confessionObject, params);
		return confessionObject;
	}

	sameUser(slackId: string) {
		return verify(slackId, this.hash);
	}

	async updateDB() {
		await putConfession(this);
	}

	async stage() {
		this.stagingTs = await chatPostMessage(
			process.env.CONFESSIONS_REVIEW,
			stagingMessage(this.id, this.confession)
		);
		this.state = "staged";
		await this.updateDB();
	}

	async reject(reviewer: string) {
		this.state = "rejected";
		this.reviewer = reviewer;
		if (!this.stagingTs) {
			// this should never happen :DDDD
			throw new Error("THIS SHOULD NEVER HAPPEN: NO STAGING TS ON APPROVAL");
		}
		await Promise.all([
			chatUpdate(
				this.stagingTs,
				process.env.CONFESSIONS_REVIEW,
				reviewedMessage(this.id, this.confession, "rejected", reviewer)
			),
			this.updateDB(),
		]);
	}

	async approve(channel: ConfessionChannel, reviewer: string) {
		this.state = "approved";
		this.channel = channel;
		this.reviewer = reviewer;
		if (!this.stagingTs) {
			throw new Error("THIS SHOULD NEVER HAPPEN: NO STAGING TS ON APPROVAL");
		}
		const status = channel === process.env.META ? "meta" : "approved";

		[this.approvalTs] = await Promise.all([
			chatPostMessage(channel, approvalMessage(this.id, this.confession)),
			chatPostMessage(
				process.env.CONFESSIONS_LOG,
				logMessage(this.id, status === "meta" ? "approved for meta" : "approved")
			),
			chatUpdate(
				this.stagingTs,
				process.env.CONFESSIONS_REVIEW,
				reviewedMessage(this.id, this.confession, status, reviewer)
			),
		]);
		await this.updateDB();
	}

	async tw(reviewer: string, tw: string) {
		this.state = "approved";
		this.channel = process.env.CONFESSIONS;
		this.reviewer = reviewer;
		if (!this.stagingTs) {
			throw new Error("THIS SHOULD NEVER HAPPEN: NO STAGING TS ON APPROVAL");
		}

		this.approvalTs = await chatPostMessage(
			this.channel,
			`*${this.id}*: TW: ${tw} — open thread to view`
		);
		await Promise.all([
			chatPostMessage(process.env.CONFESSIONS, this.confession, {
				thread_ts: this.approvalTs,
			}),
			chatPostMessage(
				process.env.CONFESSIONS_LOG,
				logMessage(this.id, "approved")
			),
			chatUpdate(
				this.stagingTs,
				process.env.CONFESSIONS_REVIEW,
				reviewedMessage(this.id, this.confession, "approved", reviewer)
			),
			this.updateDB(),
		]);
	}

	async undo(reviewer: string) {
		if (this.state !== "approved" && this.state !== "rejected") {
			return;
		}
		let promises: Promise<void>[] = [Promise.resolve()];
		if (this.channel && this.approvalTs) {
			const channel = this.channel;
			const messages = await getAllMyMessages(channel, this.approvalTs);
			promises = messages.map((id) => chatDelete(id, channel));
		}

		if (!this.stagingTs || !this.reviewer) {
			throw new Error(
				"THIS SHOULD NEVER HAPPEN: NO STAGING TS OR REVIEWER ON UNDO"
			);
		}

		const status =
			this.state === "approved"
				? this.channel === process.env.CONFESSIONS
					? "approved"
					: "meta"
				: "rejection";

		const previousReviewer = this.reviewer;
		this.state = "staged";
		this.channel = undefined;
		this.reviewer = undefined;

		await Promise.all([
			...promises,
			this.updateDB(),
			chatUpdate(
				this.stagingTs,
				process.env.CONFESSIONS_REVIEW,
				stagingMessage(this.id, this.confession)
			),
			chatPostMessage(
				process.env.CONFESSIONS_REVIEW,
				undoneConfession(status, previousReviewer, this.id, reviewer),
				{
					reply_broadcast: true,
					thread_ts: this.stagingTs,
				}
			),
		]);
	}

	async reply(message: string) {
		if (this.state !== "approved" || !this.approvalTs || !this.channel) {
			throw new Error("State not approved or no approval timestamp");
		}
		await chatPostMessage(this.channel, sanitizeMessage(message), {
			thread_ts: this.approvalTs,
		});
	}
}
