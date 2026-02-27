export const confessionChannel = {
  meta: process.env.META,
  confessions: process.env.CONFESSIONS,
} as const;

export type ConfessionChannel =
  (typeof confessionChannel)[keyof typeof confessionChannel];
