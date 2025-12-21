import { Elysia } from "elysia";
import dmReceived from "./api/dmRecieved";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { drizzle } from 'drizzle-orm/libsql/node';

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

app.post("api",
	(req) => {
		const body: any = req.body;
		const status = req.status;
		if (!body) {
			return status(405,"Method Not Allowed")
		}
		switch (body.type || "") {
			case "url_verification":
				return body.challenge;

			case "event_callback":
				if (!body.event) {
					status(405,"Method Not Allowed")
				}

				if (body.event.type === "message" && body.event.channel_type === "im") dmReceived(body);

				return status(200, "OK")

			default:
				return status(405,"Method Not Allowed")
		}
	})

app.listen(3000);

console.log("listening @ http://localhost:3000, docs at http://localhost:3000/openapi");