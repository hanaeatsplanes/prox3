import { redis } from "bun";
import { Elysia } from "elysia";
import command from "@/command";
import events from "@/events";

console.log("[startup] connecting to redis...");
await redis.connect();
console.log("[startup] redis connected");

new Elysia()
    .use(command)
    .use(events)
    .get("/", "Up!")
    .listen({ hostname: "0.0.0.0", port: 3000 }, () => {
        console.log("[startup] listening on port 3000");
    });
