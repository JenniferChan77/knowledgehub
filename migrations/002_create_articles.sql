CREATE TABLE articles(
  id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL CHECK(char_length(title) BETWEEN 1 AND 200),
  body TEXT NOT NULL,
  comment_count INTEGER NOT NULL DEFAULT 0 CHECK(comment_count >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX articles_created_at_id_idx ON articles(created_at DESC, id DESC);

CREATE INDEX articles_author_id_idx ON articles(author_id);