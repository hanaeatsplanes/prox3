import { redis, sql } from "bun";
import { Confession } from "@/core/confession.ts";

export async function nextId() {
	return await redis.incr("id");
}

export async function getConfessionBy(
	column: "staging_ts" | "approval_ts" | "id",
	ts: string | number
) {
	const key = `confession:${column}:${ts}`;

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
		await sql`SELECT * FROM confessions WHERE ${sql(column)} = ${ts}`;

	const row = confessionBody?.[0];
	if (!row) return null;

	const confession = {
		approvalTs: row.approval_ts,
		channel: row.channel,
		confession: row.confession,
		hash: row.hash,
		id: row.id,
		reviewer: row.reviewer,
		stagingTs: row.staging_ts,
		state: row.state,
	};

	try {
		await redis.setex(key, 60 * 10, JSON.stringify(confession));
	} catch (error) {
		console.error(`[db] redis setex failed for ${key}`, error);
	}

	return Confession.from(confession);
}

export async function getStagedConfessions() {
	const rows =
		await sql`SELECT * FROM confessions WHERE state = 'staged' ORDER BY id`;
	if (!rows?.length) return [];
	const confessions: Confession[] = [];
	for (const row of rows) {
		if (!row) continue;

		const confessionData = {
			approvalTs: row.approval_ts,
			channel: row.channel,
			confession: row.confession,
			hash: row.hash,
			id: row.id,
			reviewer: row.reviewer,
			stagingTs: row.staging_ts,
			state: row.state,
		};
		const confession = Confession.from(confessionData);
		confessions.push(confession);
	}
	return confessions;
}

export async function putConfession(confession: Confession) {
	const existing = await getConfessionBy("id", confession.id);

	if (existing) {
		await sql`
        UPDATE confessions SET
          hash = ${confession.hash},
          confession = ${confession.confession},
          channel = ${confession.channel},
          staging_ts = ${confession.stagingTs},
          state = ${confession.state},
          approval_ts = ${confession.approvalTs},
          reviewer = ${confession.reviewer}
        WHERE id = ${confession.id}
        `;
	} else {
		await sql`
        INSERT INTO confessions (
          id,
          hash,
          confession,
          channel,
          staging_ts,
          state,
          approval_ts,
          reviewer
        )
        VALUES (
          ${confession.id},
          ${confession.hash},
          ${confession.confession},
          ${confession.channel},
          ${confession.stagingTs},
          ${confession.state},
          ${confession.approvalTs},
          ${confession.reviewer}
        )
        `;
	}
	await redis.setex(
		`confession:staging_ts:${confession.stagingTs}`,
		60 * 10,
		JSON.stringify(confession)
	);
	if (confession.approvalTs) {
		await redis.setex(
			`confession:approval_ts:${confession.approvalTs}`,
			60 * 10,
			JSON.stringify(confession)
		);
	}
}
