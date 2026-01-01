declare namespace NodeJS {
	interface ProcessEnv {
		TURSO_AUTH_TOKEN: string
		TURSO_DATABASE_URL: string
		SLACK_BOT_TOKEN: string
		SLACK_SIGNING_SECRET: string
		CONFESSIONS: string
		META: string
		CONFESSIONS_REVIEW: string
		CONFESSIONS_LOG: string
		NODE_ENV: "development" | "production" | "test"
	}
}
