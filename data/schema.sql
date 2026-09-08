-- Kept — Neon Postgres. Paste into the Neon SQL Editor and run once.
-- One table, no accounts. Everything the family shares lives here.
--
-- No RLS, no policies, no row-level anything: nothing but the server ever
-- holds DATABASE_URL, so the database has exactly one client.

create table if not exists items (
  id         uuid primary key,           -- minted client-side, see store.ts
  date       date not null,
  what       text not null,              -- "Threading"
  usual      numeric(10,2) not null default 0,   -- what it usually costs
  spent      numeric(10,2),              -- null = still planned; set = closed out
  move       text not null default '',   -- "Instead, I could do it at home"
  who        text not null default '',   -- who kept the difference
  created_at timestamptz not null default now()
);

create index if not exists items_date_idx on items (date, created_at);
