import * as d from "drizzle-orm";
import * as p from "drizzle-orm/sqlite-core";

export const confessions = p.sqliteTable("confessions",
	{
		id: p.integer().primaryKey(),
		hash: p.text().notNull(),
		salt: p.text().notNull(),
		published: p.integer({ mode: "boolean" }).notNull(),
		publishTs: p.integer().unique(),
		stagingTs: p.integer().notNull(),
		content: p.text().notNull(),
	}
)

export type Confession = d.InferSelectModel<typeof confessions>;
export type NewConfession = d.InferInsertModel<typeof confessions>;