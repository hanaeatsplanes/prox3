import type { MessageActionEvent } from "@/models/event.ts";

export default async function messageActionHandler(body: MessageActionEvent) {
	console.log("MessageActionHandler", body);
}
