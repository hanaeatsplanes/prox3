import { sql } from "bun";
import type { Context } from "elysia";

export default async function ({ query }: Context) {
	const count = query["count"] ? parseInt(query["count"]) : 10;
	const status = query["status"];
	if (count < 0) throw new RangeError("count must be greater than 0");
	const result = await sql`
        SELECT * FROM confessions 
        ${status ? sql`WHERE state = ${status}` : sql``} 
        ORDER BY id DESC 
        LIMIT ${count}
    `;
	if (!result?.length) return [];
	return result.map(
		(row: {
			confession: string;
			id: string;
			reviewer: string;
			state: string;
		}) => ({
			confession: row.confession,
			id: row.id,
			reviewer: row.reviewer,
			state: row.state,
		})
	);
}
