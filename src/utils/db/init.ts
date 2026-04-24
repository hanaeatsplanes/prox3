import { redis, sql } from "bun";

export async function initializeDatabase() {
	try {
		console.log("[db] initializing database...");
		await sql.file("./sql/init.sql");
		console.log("[db] database initialized");
	} catch (err) {
		console.error("[db] failed to initialize database:", err);
		throw err;
	}
}

export async function initializeRedis() {
	try {
		console.log("[db] initializing redis id counter...");
		const result = await sql`SELECT MAX(id) as max_id FROM confessions`;
		const maxId = result?.[0]?.max_id ?? 0;
		await redis.set("id", `${maxId}`);
		console.log("[db] redis id counter initialized to", maxId);
	} catch (err) {
		console.error("[db] failed to initialize redis id counter:", err);
		throw err;
	}
}
