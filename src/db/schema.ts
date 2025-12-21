import { int, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const stagedConfessionsTable = sqliteTable("staged_confessions",
	{
		id: int().primaryKey(),
		hash: text().notNull(),
		salt: text().notNull(),
		stagingTs: int().notNull().unique(),
		content: text().notNull()
	}
)

export const confessionsTable = sqliteTable("confessions",
	{
		id: int().primaryKey().references(() => stagedConfessionsTable.id),
		hash: text().notNull(),
		salt: text().notNull(),
		publishTs: int().notNull().unique(),
		stagingTs: int().notNull(),
		content: text().notNull(),
	}
)