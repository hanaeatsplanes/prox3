import {Elysia} from "elysia";
import openapi, {fromTypes} from "@elysiajs/openapi";
import {drizzle} from 'drizzle-orm/libsql/node';
import {slackEventHandler} from "./api/slackEventHandler";

const app = new Elysia()
	.use(
		openapi({
			references: fromTypes()
		})
	)



const db = drizzle({ connection: {
		url: process.env.TURSO_DATABASE_URL,
		authToken: process.env.TURSO_AUTH_TOKEN
	}});

app.post("api", ({ body, status }) => slackEventHandler(body, status));

app.listen(3000);

console.log("listening @ http://localhost:3000, docs at http://localhost:3000/openapi");