import { sql } from "bun";

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
