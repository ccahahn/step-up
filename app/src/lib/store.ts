import "server-only";
import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Item } from "./types";

// The only file that touches storage. Neon Postgres when DATABASE_URL is set,
// otherwise a JSON file so `npm run dev` works with nothing configured.

const url = process.env.DATABASE_URL;
const isProd = process.env.NODE_ENV === "production";
export const usingDatabase = Boolean(url);

const db = () => neon(url!);

const LOCAL = path.join(process.cwd(), "..", "data", "local.json");

/**
 * The JSON file is a dev convenience and nothing else. A deployment whose
 * DATABASE_URL never arrived would otherwise fall through to it, read an empty
 * list from a file that isn't there, and fail every write against a read-only
 * filesystem — looking like a database problem when it is a config problem.
 */
function assertLocalAllowed(): void {
  if (isProd)
    throw new Error(
      "DATABASE_URL is not set, so the app has no database. Add it under " +
        "Settings → Environment Variables and redeploy — env vars added after " +
        "a deployment do not reach it until you redeploy.",
    );
}

async function readLocal(): Promise<Item[]> {
  try {
    return JSON.parse(await fs.readFile(LOCAL, "utf8"));
  } catch {
    return [];
  }
}

async function writeLocal(rows: Item[]) {
  await fs.mkdir(path.dirname(LOCAL), { recursive: true });
  await fs.writeFile(LOCAL, JSON.stringify(rows, null, 2));
}

/** Dates and numerics come back as text on purpose — see listItems. */
function toItem(r: Record<string, unknown>): Item {
  return {
    id: String(r.id),
    date: String(r.date),
    what: String(r.what),
    usual: Number(r.usual),
    spent: r.spent === null || r.spent === undefined ? null : Number(r.spent),
    move: String(r.move ?? ""),
    who: String(r.who ?? ""),
    created_at: String(r.created_at),
  };
}

export async function listItems(): Promise<Item[]> {
  if (!usingDatabase) {
    assertLocalAllowed();
    return readLocal();
  }
  const sql = db();
  // to_char, not the raw date column: the driver would hand back a JS Date in
  // the server's zone and "2026-09-07" could arrive as the 6th.
  const rows = await sql`
    select id,
           to_char(date, 'YYYY-MM-DD') as date,
           what, usual, spent, move, who,
           to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') as created_at
      from items
     order by date, created_at
  `;
  return rows.map(toItem);
}

/** The id is minted on the client so the row can appear before the round trip. */
export async function addItem(row: Omit<Item, "created_at">): Promise<void> {
  if (!usingDatabase) {
    assertLocalAllowed();
    const rows = await readLocal();
    rows.push({ ...row, created_at: new Date().toISOString() });
    return writeLocal(rows);
  }
  const sql = db();
  await sql`
    insert into items (id, date, what, usual, spent, move, who)
    values (${row.id}, ${row.date}, ${row.what}, ${row.usual},
            ${row.spent}, ${row.move}, ${row.who})
    on conflict (id) do nothing
  `;
}

export async function setSpent(id: string, spent: number): Promise<void> {
  if (!usingDatabase) {
    assertLocalAllowed();
    const rows = await readLocal();
    const row = rows.find((r) => r.id === id);
    if (row) row.spent = spent;
    return writeLocal(rows);
  }
  const sql = db();
  await sql`update items set spent = ${spent} where id = ${id}`;
}

export async function setWho(id: string, who: string): Promise<void> {
  if (!usingDatabase) {
    assertLocalAllowed();
    const rows = await readLocal();
    const row = rows.find((r) => r.id === id);
    if (row) row.who = who;
    return writeLocal(rows);
  }
  const sql = db();
  await sql`update items set who = ${who} where id = ${id}`;
}

export async function removeItem(id: string): Promise<void> {
  if (!usingDatabase) {
    assertLocalAllowed();
    const rows = await readLocal();
    return writeLocal(rows.filter((r) => r.id !== id));
  }
  const sql = db();
  await sql`delete from items where id = ${id}`;
}
