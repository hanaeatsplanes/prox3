import {InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as p from "drizzle-orm/sqlite-core";

export const confessions = sqliteTable("confessions",
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

export type StagedConfession = InferSelectModel<typeof stagedConfessions>;
export type NewStagedConfession = InferInsertModel<typeof users>;