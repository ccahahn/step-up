"use client";

import { m } from "@/lib/format";
import { isOpen, type Item } from "@/lib/types";

export default function Home({
  items,
  onPlan,
  onOpen,
}: {
  items: Item[];
  onPlan: () => void;
  onOpen: () => void;
}) {
  const open = items.filter(isOpen);
  const shut = items.filter((i) => !isOpen(i));
  const owed = open.reduce((s, i) => s + (Number(i.usual) || 0), 0);
  const paid = shut.reduce((s, i) => s + (Number(i.spent) || 0), 0);

  const lines: string[] = [];
  if (open.length) lines.push(`${open.length} planned, ${m(owed)}`);
  if (shut.length) lines.push(`${shut.length} closed, ${m(paid)}`);

  return (
    <section>
      <button className="go" onClick={onPlan}>
        Plan something
      </button>

      {lines.length > 0 && (
        <div className="foot">
          <button type="button" onClick={onOpen}>
            <span className="lines">
              {lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
            <span className="arw">&#8594;</span>
          </button>
        </div>
      )}
    </section>
  );
}
