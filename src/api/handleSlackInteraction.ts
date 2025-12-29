import {Context} from "elysia";
import validateRequest from "@/lib/validateRequest";

export default function handleSlackInteraction(context: Context) {
	const { body, headers, set, status } = context;

	validateRequest(headers, body);

	try {
	} catch (e) {
		console.error(e)
	}
}