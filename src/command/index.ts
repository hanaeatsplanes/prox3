import { Elysia } from "elysia";

export default new Elysia().post("/api/command", console.log);
