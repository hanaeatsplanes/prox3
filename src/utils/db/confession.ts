import { redis, sql } from "bun";
import { Confession } from "@/core/confession.ts";

export async function nextId() {
	return await redis.incr("id");
}

export async function getConfessionBy(
	column: "staging_ts" | "approval_ts",
	ts: string
) {
	const tag = column === "staging_ts" ? "staging" : "approval";
	const key = `confession:${tag}:${ts}`;

	const redisRes = await redis.get(key);
	if (redisRes) {
		try {
			await redis.expire(key, 60 * 10);
		} catch (error) {
			console.error(`[db] redis expire failed for ${key}`, error);
		}
		return Confession.from(JSON.parse(redisRes));
	}

	const confessionBody =
		await sql`SELECT * FROM confessions WHERE ${column} = ${ts} `;

	const confession = confessionBody?.[0];
	if (confession) {
		try {
			await redis.setex(key, 60 * 10, JSON.stringify(confession));
		} catch (error) {
			console.error(`[db] redis setex failed for ${key}`, error);
		}
	}

	return confession ? Confession.from(confession) : null;
}

export async function putConfession(confession: Confession) {
	await Promise.all([
		sql`
        INSERT INTO confessions (
          id,
          hash,
          confession,
          channel,
          staging_ts,
          state,
          approval_ts
        )
        VALUES (
          ${confession.id},
          ${confession.hash},
          ${confession.confession},
          ${confession.channel},
          ${confession.stagingTs},
          ${confession.state},
          ${confession.approvalTs}
        )
        ON CONFLICT (id) DO UPDATE SET
        hash = EXCLUDED.hash,
        confession = EXCLUDED.confession,
        channel = EXCLUDED.channel,
        staging_ts = EXCLUDED.staging_ts,
        state = EXCLUDED.state,
        approval_ts = EXCLUDED.approval_ts
    `,
		redis.setex(
			`confession:staging:${confession.stagingTs}`,
			60 * 10,
			JSON.stringify(confession)
		),
		(() => {
			if (confession.approvalTs) {
				return redis.setex(
					`confession:approval:${confession.approvalTs}`,
					60 * 10,
					JSON.stringify(confession)
				);
			}
			return Promise.resolve();
		})(),
	]);
}
