declare namespace NodeJS {
    interface ProcessEnv {
        SLACK_SIGNING_SECRET: string;
        SLACK_CLIENT_ID: string;
    }
}