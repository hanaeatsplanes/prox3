import crypto from "crypto";
import * as s from '@/db/schema'
import { db } from "@/db"
import nextConfessionId from "@/lib/nextId";

export default async function stageConfession(message: string, slackId: string) {
	try {
		const salt = crypto.randomBytes(16).toString("hex"); // stolen from ani

		const hash = crypto.scryptSync(Buffer.from(slackId), salt, 64).toString("hex");

		const id = await nextConfessionId()

		const res = await fetch(new Request("https://slack.com/api/chat.postMessage", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
				"Content-Type": 'application/json'
			},
			body: JSON.stringify({
				channel: process.env.CONFESSIONS_REVIEW,
				reply_broadcast: true,
				message: `(staging) ${id} ${message}`,
			})
		}));

		if (!res.ok) {
			throw new Error(res.statusText);
		}
		const body = await res.json()
		if (!body.ok) {
			throw new Error(body.error ?? res.statusText);
		}

		const confession: s.NewConfession = {
			hash: hash,
			salt: salt,
			published: false,
			content: message,
			stagingTs: 0, // TODO: PUT A STANGIGN TS HERE
			id: id
		}

		await db.insert(s.confessions).values(confession)

		return id
	} catch (err) {
		console.log(err)
		throw err
	}
}