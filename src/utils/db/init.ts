import { redis, sql } from "bun";

export async function initializeDatabase() {
	try {
		await sql.file("./sql/init.sql");
	} catch (err) {
		console.error("[db] failed to initialize database:", err);
		throw err;
	}
}

export async function initializeRedis() {
	try {
		const result = await sql`SELECT MAX(id) as max_id FROM confessions`;
		const maxId = result?.[0]?.max_id ?? 0;
		await redis.set("id", `${maxId}`);
	} catch (err) {
		console.error("[db] failed to initialize redis id counter:", err);
		throw err;
	}
}
