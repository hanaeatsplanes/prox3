import {Elysia} from "elysia";
import openapi, {fromTypes} from "@elysiajs/openapi";
// import {slackEventHandler} from "./api/slackEventHandler";
import nextConfessionId from "./lib/nextId";
import handleSlackEvent from "@/api/handleSlackEvent";
import handleSlackInteraction from "@/api/handleSlackInteraction";

const app = new Elysia()
	.use(
		openapi({
			references: fromTypes()
		})
	)

app.onAfterResponse(({ request, set, body, responseValue }) => {
	const url = new URL(request.url);
	const path = url.pathname + url.search;
	const status = set.status ?? 200;
	if (status === 200 || status === 404) {
		console.log(`[${new Date().toLocaleTimeString()}] ${request.method} ${path} ${status}`);
	} else {
		console.log(`[${new Date().toLocaleTimeString()}] ${request.method} ${path} ${status}`, body, responseValue);
	}
});

app.post("api/event", async (request) => await handleSlackEvent(request), {
	parse: "text"
});

app.post("api/interact", async (request) => await handleSlackInteraction(request), {
	parse: "text"
})

app.get("/nextConfessionId", nextConfessionId);

app.listen(3000);
console.log("listening @ http://localhost:3000, docs at http://localhost:3000/openapi");