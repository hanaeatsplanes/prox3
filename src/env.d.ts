declare namespace NodeJS {
  interface ProcessEnv {
    SLACK_SIGNING_SECRET: string;
    SLACK_TOKEN: string;
    META: string;
    CONFESSIONS: string;
    CONFESSIONS_LOG: string;
    CONFESSIONS_REVIEW: string;
  }
}
