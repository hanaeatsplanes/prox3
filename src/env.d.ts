declare namespace NodeJS {
	interface ProcessEnv {
		CONFESSIONS: string;
		CONFESSIONS_LOG: string;
		CONFESSIONS_REVIEW: string;
		META: string;
		POSTGRES_DB: string;
		POSTGRES_PASSWORD: string;
		POSTGRES_PORT: number;
		POSTGRES_URL: string;
		POSTGRES_USER: string;
		REDIS_PASSWORD: string;
		REDIS_PORT: number;
		REDIS_URL: string;
		SLACK_BOT_ID: string;
		SLACK_SIGNING_SECRET: string;
		SLACK_TOKEN: string;
	}
}
