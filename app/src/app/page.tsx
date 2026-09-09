import StepUp from "@/components/StepUp";
import { listItems, usingDatabase } from "@/lib/store";
import type { Item } from "@/lib/types";

// Always read fresh — the family shares this list, so a cached page is a wrong page.
export const dynamic = "force-dynamic";

export default async function Page() {
  // A misconfigured deployment should still render the app and say what is
  // wrong, rather than showing the framework's blank "server error" page.
  let items: Item[] = [];
  let error: string | null = null;
  try {
    items = await listItems();
  } catch (e) {
    console.error("[step-up] initial read failed:", e);
    error = e instanceof Error ? e.message : String(e);
  }

  return <StepUp initial={items} shared={usingDatabase} initialError={error} />;
}
