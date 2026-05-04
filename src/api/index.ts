import { Elysia } from "elysia";

const app = new Elysia().guard();
app.post("/api/approve");
export default app;
