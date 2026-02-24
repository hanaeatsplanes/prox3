declare namespace NodeJS {
  interface ProcessEnv {
    SLACK_SIGNING_SECRET: string;
    SLACK_TOKEN: string;
    META: string;
    CONFESSIONS: string;
    CONFESSIONS_LOG: string;
    CONFESSIONS_REVIEW: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    POSTGRES_PORT: number;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
  }
}
