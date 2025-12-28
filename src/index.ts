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

app.onAfterResponse(({ request, set }) => {
	const url = new URL(request.url);
	const path = url.pathname + url.search;
	const status = set.status ?? 200;
	console.log(`[${new Date().toLocaleTimeString()}] ${request.method} ${path} ${status}`);
});

app.post("api/slack", (req) => {
	const body = req.body;
	console.log(body);
});

app.get("/nextConfessionId", nextConfessionId);

app.listen(3000);
console.log("listening @ http://localhost:3000, docs at http://localhost:3000/openapi");