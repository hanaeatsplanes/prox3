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
                         )
            ),
    approval_ts TEXT UNIQUE,
    reviewer TEXT
);