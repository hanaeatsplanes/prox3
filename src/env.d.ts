declare namespace NodeJS {
  interface ProcessEnv {
    SLACK_SIGNING_SECRET: string
    SLACK_TOKEN: string
  }
}
