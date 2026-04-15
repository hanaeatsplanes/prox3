import { redis, sql } from "bun";
import { Confession } from "@/core/confession.ts";

export async function nextId() {
	return await redis.incr("id");
}

export async function getConfession(id: string) {
	const redisRes = await redis.get(`confession:${id}`);
	if (redisRes) {
		redis
			.expire(`confession:${id}`, 60 * 10)
			.catch((err) =>
				console.error(`[db] redis expire failed for confession ${id}:`, err)
			);
		return Confession.from(JSON.parse(redisRes));
	}

	const confessionBody = await sql`
    SELECT * FROM confessions WHERE id = ${id}
  `;

	const confession = confessionBody?.[0];
	if (confession) {
		redis
			.setex(`confession:${id}`, 60 * 10, JSON.stringify(confession))
			.catch((err) =>
				console.error(`[db] redis setex failed for confession ${id}:`, err)
			);
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
			`confession:${confession.id}`,
			60 * 10,
			JSON.stringify(confession)
		),
	]);
}
