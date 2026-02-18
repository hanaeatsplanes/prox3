import { Elysia } from "elysia";
import register from "./register";

const app = new Elysia()
register(app)