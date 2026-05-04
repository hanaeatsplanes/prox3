import { redis } from "bun";
import { Elysia } from "elysia";
import api from "@/api";
import events from "@/events";
import { initializeDatabase, initializeRedis } from "@/utils/db/init";

console.log("[startup] connecting to redis...");
await redis.connect();
console.log("[startup] redis connected");

console.log("[startup] initializing database...");
await initializeDatabase();

console.log("[startup] initializing redis...");
await initializeRedis();

new Elysia()
	.use(events)
	.use(api)
	.get("/", "Up!")
	.listen({ hostname: "0.0.0.0", port: 3000 }, () => {
		console.log("[startup] listening on port 3000");
	});
