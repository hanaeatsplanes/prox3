import { redis } from "bun";
import { Elysia } from "elysia";
import command from "@/command";
import events from "@/events";

const connectRedis = async (
  retries: number = 10,
  delay: number = 2000
): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await redis.connect();
      return;
    } catch {
      console.log(
        `Redis connection attempt ${i + 1}/${retries} failed, retrying in ${delay}ms...`
      );
      await Bun.sleep(delay);
    }
  }
  throw new Error("Failed to connect to Redis after all retries");
};

await connectRedis();

export default new Elysia()
  .use(command)
  .use(events)
  .listen(3000, () => {
    console.log("Listening on port 3000");
  });
