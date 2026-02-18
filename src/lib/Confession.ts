import crypto from "crypto";
import { db } from "@/db";
import * as s from "@/db/schema";
import nextConfessionId from "@/lib/nextId";

export default class Confession {
	id: number;
	content: string;
	hash: string;
	salt: string;
	stagingTs: number;
	published: boolean;

	constructor(id: number, content: string, hash: string, salt: string, stagingTs: number, published: boolean) {
		this.id = id;
		this.content = content;
		this.hash = hash;
		this.salt = salt;
		this.stagingTs = stagingTs;
		this.published = published;
	}

	static async create(message: string, slackId: string): Promise<Confession> {
		const salt = crypto.randomBytes(16).toString("hex");
		const hash = crypto.scryptSync(Buffer.from(slackId), salt, 64).toString("hex");
		const id = await nextConfessionId();

		return new Confession(id, message, hash, salt, 0, false);
	}

	async stageConfession(): Promise<void> {
		// TODO: implement staging logic (post to review channel, insert into DB)
	}

	async publishConfession(channel: "meta" | "confessions"): Promise<void> {
		// TODO: implement publish logic (post to target channel, update DB)
	}
}
