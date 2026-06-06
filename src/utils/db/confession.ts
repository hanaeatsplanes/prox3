import { redis, sql } from "bun";
import { Confession } from "@/models/confession.ts";

export async function nextId() {
	return await redis.incr("id");
}

export async function getConfessionBy(
	column: "staging_ts" | "approval_ts" | "id",
	id: string | number
) {
	const key = `confession:${column}:${id}`;

	const redisRes = await redis.get(key);
	if (redisRes) {
		try {
			await redis.expire(key, 60 * 10);
		} catch (error) {
			console.error(`[db] redis expire failed for ${key}`, error);
		}
		return Confession.from(JSON.parse(redisRes));
	}

	const confessionBody = await sql`SELECT * FROM confessions WHERE ${sql(column)} = ${id}`;

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
	const rows = await sql`SELECT * FROM confessions WHERE state = 'staged' ORDER BY id`;
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
	const query = await sql`
		SELECT staging_ts, approval_ts FROM confessions WHERE id = ${confession.id}
	`;
	const prev = query?.[0];

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
	ON CONFLICT (id) DO UPDATE SET
		hash = ${confession.hash},
		confession = ${confession.confession},
		channel = ${confession.channel},
		staging_ts = ${confession.stagingTs},
		state = ${confession.state},
		approval_ts = ${confession.approvalTs},
		reviewer = ${confession.reviewer}
	`;
	const s = JSON.stringify(confession);
	const ops: Promise<unknown>[] = [redis.setex(`confession:id:${confession.id}`, 60 * 10, s)];

	if (prev?.staging_ts && prev.staging_ts !== confession.stagingTs) {
		ops.push(redis.del(`confession:staging_ts:${prev.staging_ts}`));
	}
	if (prev?.approval_ts && prev.approval_ts !== confession.approvalTs) {
		ops.push(redis.del(`confession:approval_ts:${prev.approval_ts}`));
	}
	if (confession.stagingTs) {
		ops.push(redis.setex(`confession:staging_ts:${confession.stagingTs}`, 600, s));
	}
	if (confession.approvalTs) {
		ops.push(redis.setex(`confession:approval_ts:${confession.approvalTs}`, 600, s));
	}
	await Promise.all(ops);
}
