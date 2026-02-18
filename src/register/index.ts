import type { Elysia } from "elysia";
import command from "@/command"
import events from "@/events"

export default function register(app: Elysia){
    app.get("/api/prox3", command)
    app.get("/api/event", events)
}