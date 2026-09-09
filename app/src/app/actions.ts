"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";
import type { Item } from "@/lib/types";

// The client renders optimistically and calls these to persist; revalidatePath
// is what makes a second phone pick the change up on next load.
//
// These return a result rather than throwing. A server action that throws
// reaches the browser as an opaque digest in production, which left the failure
// banner unable to say anything useful about why a write did not land.

export type Result = { ok: true } | { ok: false; error: string };

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

async function run(work: () => Promise<void>): Promise<Result> {
  try {
    await work();
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    console.error("[step-up] write failed:", e);
    return { ok: false, error: message(e) };
  }
}

export async function addItemAction(row: Omit<Item, "created_at">) {
  return run(() => store.addItem(row));
}

export async function closeOutAction(id: string, spent: number) {
  return run(() => store.setSpent(id, spent));
}

export async function setMoveAction(id: string, move: string) {
  return run(() => store.setMove(id, move));
}

export async function setWhoAction(id: string, who: string) {
  return run(() => store.setWho(id, who));
}

export async function removeItemAction(id: string) {
  return run(() => store.removeItem(id));
}

export async function refreshAction(): Promise<
  { ok: true; items: Item[] } | { ok: false; error: string }
> {
  try {
    return { ok: true, items: await store.listItems() };
  } catch (e) {
    console.error("[step-up] read failed:", e);
    return { ok: false, error: message(e) };
  }
}
