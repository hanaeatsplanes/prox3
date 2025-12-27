import {Elysia} from "elysia";
import openapi, {fromTypes} from "@elysiajs/openapi";
// import {slackEventHandler} from "./api/slackEventHandler";
import nextConfessionId from "./lib/nextId";

const app = new Elysia()
	.use(
		openapi({
			references: fromTypes()
		})
	)

// app.post("api", ({ body, status }) => slackEventHandler(body, status));

app.get("/nextConfessionId", nextConfessionId);

app.listen(3000);

console.log("listening @ http://localhost:3000, docs at http://localhost:3000/openapi");