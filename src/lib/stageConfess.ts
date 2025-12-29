import crypto from "crypto";
import * as s from '@/db/schema'
import { db } from "@/db"
import nextConfessionId from "@/lib/nextId";

export default async function stageConfession(message: string, slackId: string) {
	try {
		const salt = crypto.randomBytes(16).toString("hex"); // stolen from ani

		const hash = crypto.scryptSync(Buffer.from(slackId), salt, 64).toString("hex");

		const id = await nextConfessionId()

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