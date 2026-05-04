import { redis } from "bun";
import { Elysia } from "elysia";
import api from "@/api";
import events from "@/events";
import { initializeDatabase, initializeRedis } from "@/utils/db/init";

await redis.connect();
await initializeDatabase();
await initializeRedis();

new Elysia()
	.use(events)
	.use(api)
	.get("/", "Up!")
	.listen({ hostname: "0.0.0.0", port: 3000 });
