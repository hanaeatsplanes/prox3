import { db } from "@/index";

export default function nextConfessionId() {
	const result = db
		.selectFrom("confessions")
		.select(db.fn.max("id").as("maxId"))
		.executeTakeFirstSync();
	if (!result) {
		return 1
	}
	return result
}