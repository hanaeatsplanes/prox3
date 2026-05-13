import { fromTypes, openapi } from "@elysia/openapi";
import { cors } from "@elysiajs/cors";
import { redis } from "bun";
import { Elysia } from "elysia";
import api from "@/api";
import events from "@/events";
import { initializeDatabase, initializeRedis } from "@/utils/db/init";

await redis.connect();
await initializeDatabase();
await initializeRedis();

new Elysia()
	.use(cors())
	.use(events)
	.use(api)
	.get("/", "Up!")
	.use(
		openapi({
			documentation: {
				info: {
					contact: {
						email: "contact@sahana.dev",
						name: "Sahana Celestine",
					},
					description: "An API to interact with Prox3 confessions programmatically.",
					license: {
						name: "GNU General Public License v3.0 or later",
						url: "https://spdx.org/licenses/GPL-3.0-or-later.html",
					},
					title: "Prox3",
					version: "1.0.0",
				},
			},
			exclude: {
				paths: ["/slack/command", "/", "/slack/events"],
			},
			path: "/docs",
			references: fromTypes(),
		})
	)
	.listen({ hostname: "0.0.0.0", port: 3000 });
