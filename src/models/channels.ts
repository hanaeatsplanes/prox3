export const confessionChannel = {
    confessions: process.env.CONFESSIONS,
    meta: process.env.META,
} as const;

export type ConfessionChannel =
    (typeof confessionChannel)[keyof typeof confessionChannel];
