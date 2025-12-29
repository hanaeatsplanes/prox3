declare namespace NodeJS {
	interface ProcessEnv {
		TURSO_AUTH_TOKEN: string
		TURSO_DATABASE_URL: string
		SLACK_BOT_TOKEN: string
		SLACK_SIGNING_SECRET: string
		SLACK_BOT_ID: string
		NODE_ENV: "development" | "production" | "test"
	}
}
