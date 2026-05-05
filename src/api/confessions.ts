import { sql } from "bun";
import type { Context } from "elysia";

export default async function ({
	query: { count, state },
}: Omit<Context, "query"> & {
	query: {
		count?: number;
		state?: "approved" | "rejected" | "staged";
	};
}) {
	if (count && count < 0) count = 10;
	const result = await sql`
        SELECT * FROM confessions 
        ${state ? sql`WHERE state = ${state}` : sql``} 
        ORDER BY id DESC 
        LIMIT ${count}
    `;
	if (!result?.length) return [];
	return result.map((row: { confession: string; id: string; reviewer: string; state: string }) => ({
		confession: row.confession,
		id: row.id,
		reviewer: row.reviewer,
		state: row.state,
	}));
}
