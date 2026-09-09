"use client";

import { useState } from "react";
import Row from "./Row";
import { m } from "@/lib/format";
import { isOpen, saved, type Item } from "@/lib/types";
import { parseWho } from "@/lib/people";

const cell = (v: unknown) => String(v ?? "").replace(/[\t\r\n]+/g, " ").trim();

/** The running list as spreadsheet columns. */
function tsv(items: Item[]): string {
  const head = [
    "Date", "What", "Usual", "Actual", "Saved",
    "Instead I could", "Who", "Status",
  ];
  const rows = items
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((i) => {
      const shut = !isOpen(i);
      return [
        i.date, cell(i.what), i.usual,
        shut ? i.spent : "", shut ? saved(i) : "",
        cell(i.move), cell(i.who), shut ? "closed" : "planned",
      ].join("\t");
    });
  return [head.join("\t"), ...rows].join("\n");
}

/** The old execCommand path — works when the async clipboard API will not. */
function legacyCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  ta.remove();
  return ok;
}

async function copy(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      // Chrome leaves this promise pending forever when the tab is not
      // focused, so the button would never say anything. Give it a beat,
      // then fall back rather than hang.
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("clipboard stalled")), 500),
        ),
      ]);
      return true;
    }
  } catch {}
  return legacyCopy(text);
}

export default function OpenList({
  items,
  opened,
  justWon,
  onToggle,
  onCloseOut,
  onMove,
  onWho,
  onRemove,
  onBack,
}: {
  items: Item[];
  opened: string | null;
  justWon: string | null;
  onToggle: (id: string) => void;
  onCloseOut: (id: string, spent: number) => void;
  onMove: (id: string, move: string) => void;
  onWho: (id: string, who: string) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}) {
  const [copyState, setCopyState] = useState<"idle" | "done" | "failed">("idle");

  const byDate = (a: Item, b: Item) => a.date.localeCompare(b.date);
  // Still ahead of us first, closed out underneath.
  const rows = [
    ...items.filter(isOpen).sort(byDate),
    ...items.filter((i) => !isOpen(i)).sort(byDate),
  ];

  // Who kept what — only counts rows that came in under. Several people can
  // be credited on one row; the saving splits between them so the tally still
  // adds up to what the family actually kept.
  const by: Record<string, number> = {};
  for (const i of items.filter((i) => !isOpen(i) && saved(i) > 0)) {
    const names = parseWho(i.who || "");
    if (names.length === 0) {
      by["—"] = (by["—"] || 0) + saved(i);
      continue;
    }
    const share = saved(i) / names.length;
    for (const n of names) by[n] = (by[n] || 0) + share;
  }
  const names = Object.keys(by).filter((k) => k !== "—");

  const flat = items.filter((i) => !isOpen(i) && saved(i) <= 0).length;

  return (
    <section>
      <div className="bar">
        <button className="back" type="button" onClick={onBack}>
          &#8592; Back
        </button>
        {items.length > 0 && (
          <button
            className={`copy${copyState === "done" ? " done" : ""}`}
            type="button"
            onClick={async () => {
              const ok = await copy(tsv(items));
              setCopyState(ok ? "done" : "failed");
              setTimeout(() => setCopyState("idle"), 1600);
            }}
          >
            {copyState === "done"
              ? "Copied"
              : copyState === "failed"
                ? "Couldn’t copy"
                : "Copy for spreadsheet"}
          </button>
        )}
      </div>

      <ul className="open">
        {rows.map((it) => (
          <Row
            key={`${it.id}:${it.spent ?? "open"}`}
            item={it}
            opened={opened === it.id}
            justWon={justWon === it.id}
            onToggle={() => onToggle(it.id)}
            onCloseOut={(spent) => onCloseOut(it.id, spent)}
            onMove={(move) => onMove(it.id, move)}
            onWho={(who) => onWho(it.id, who)}
            onRemove={() => onRemove(it.id)}
          />
        ))}
      </ul>

      {names.length > 0 && (
        <p className="tally">
          Who kept what &middot;{" "}
          {names
            .sort((a, b) => by[b] - by[a])
            .map((n, idx) => (
              <span key={n}>
                {idx > 0 && <>&nbsp;&middot;&nbsp;</>}
                <b>{n}</b> {m(by[n])}
              </span>
            ))}
          {by["—"] ? <>&nbsp;&middot;&nbsp;unassigned {m(by["—"])}</> : null}
        </p>
      )}

      {flat > 0 && (
        <p className="quiet">{flat} closed at or above usual.</p>
      )}
    </section>
  );
}
