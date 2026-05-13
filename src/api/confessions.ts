import { sql } from "bun";

export default async function ({
	query: { count, state },
}: {
	query: {
		count?: number;
		state?: "approved" | "rejected" | "staged";
	};
}) {
	if (!count || count < 0) count = 10;
	const result = state
		? await sql`
            SELECT * FROM confessions
            WHERE state = ${state}
            ORDER BY id DESC
            LIMIT ${count}
        `
		: await sql`
            SELECT * FROM confessions
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
