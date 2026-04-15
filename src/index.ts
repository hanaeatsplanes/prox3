import { redis } from "bun";
import { Elysia } from "elysia";
import events from "@/core/events";
import { initializeDatabase } from "@/utils/db/init";

console.log("[startup] connecting to redis...");
await redis.connect();
console.log("[startup] redis connected");

console.log("[startup] initializing database...");
await initializeDatabase();

new Elysia()
	.use(events)
	.get("/", "Up!")
	.listen({ hostname: "0.0.0.0", port: 3000 }, () => {
		console.log("[startup] listening on port 3000");
	});
