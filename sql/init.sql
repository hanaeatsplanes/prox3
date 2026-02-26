DROP TABLE IF EXISTS confessions;

CREATE TABLE confessions (
    id INTEGER PRIMARY KEY,
    confession TEXT NOT NULL,
    hash TEXT NOT NULL,
    channel TEXT,
    stagingTs TEXT UNIQUE,
    state TEXT NOT NULL
        CHECK ( state in ('approved',
                          'rejected',
                          'staged'
                         ))
);