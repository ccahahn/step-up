"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";
import type { Item } from "@/lib/types";

// Thin wrappers. The client renders optimistically and calls these to persist;
// revalidatePath is what makes a second phone pick the change up on next load.

export async function addItemAction(row: Omit<Item, "created_at">) {
  await store.addItem(row);
  revalidatePath("/");
}

export async function closeOutAction(id: string, spent: number) {
  await store.setSpent(id, spent);
  revalidatePath("/");
}

export async function setWhoAction(id: string, who: string) {
  await store.setWho(id, who);
  revalidatePath("/");
}

export async function removeItemAction(id: string) {
  await store.removeItem(id);
  revalidatePath("/");
}

export async function refreshAction(): Promise<Item[]> {
  return store.listItems();
}
