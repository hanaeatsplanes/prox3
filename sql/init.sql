ALTER TABLE IF EXISTS confessions
    ADD COLUMN IF NOT EXISTS confession  TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS hash        TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS channel     TEXT,
    ADD COLUMN IF NOT EXISTS staging_ts  TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS state       TEXT NOT NULL DEFAULT 'unstaged',
    ADD COLUMN IF NOT EXISTS approval_ts TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS confessions (
    id INTEGER PRIMARY KEY,
    confession TEXT NOT NULL,
    hash TEXT NOT NULL,
    channel TEXT,
    staging_ts TEXT UNIQUE,
    state TEXT NOT NULL
        CHECK ( state in ('approved',
                          'rejected',
                          'staged',
                          'unstaged'
                         )),
    approval_ts TEXT UNIQUE
);