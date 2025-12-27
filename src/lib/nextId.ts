import { db } from "@/db";
import * as s from "@/db/schema"
import { max } from "drizzle-orm";

export default async function nextConfessionId() {
	const result = await db
		.select({ maxId: max(s.confessions.id) })
		.from(s.confessions)
		.get()
	return (result?.maxId ?? 0) + 1
}