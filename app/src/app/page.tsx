import StepUp from "@/components/StepUp";
import { listItems, usingDatabase } from "@/lib/store";

// Always read fresh — two phones share this list, so a cached page is a wrong page.
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await listItems();
  return <StepUp initial={items} shared={usingDatabase} />;
}
