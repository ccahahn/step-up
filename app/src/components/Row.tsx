"use client";

import { useEffect, useRef, useState } from "react";
import MoneyInput from "./MoneyInput";
import WhoPicker from "./WhoPicker";
import { lowerFirst, m, numMoney, rawMoney, when } from "@/lib/format";
import { formatWho, parseWho } from "@/lib/people";
import { isOpen, saved, type Item } from "@/lib/types";

export default function Row({
  item,
  opened,
  justWon,
  onToggle,
  onCloseOut,
  onMove,
  onWho,
  onRemove,
}: {
  item: Item;
  opened: boolean;
  justWon: boolean;
  onToggle: () => void;
  onCloseOut: (spent: number) => void;
  onMove: (move: string) => void;
  onWho: (who: string) => void;
  onRemove: () => void;
}) {
  const shut = !isOpen(item);
  const kept = shut ? saved(item) : 0;

  const [spent, setSpent] = useState(shut ? m(item.spent!) : "");
  const [who, setWho] = useState<string[]>(parseWho(item.who ?? ""));
  const [move, setMove] = useState(item.move ?? "");
  const spentRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!opened) return;

    // Only chase the amount on a row that has not been closed out yet — that
    // is the one thing you came to type. Reopening a closed row is usually
    // about Who, and raising the keyboard there would bury the chips.
    if (!shut) spentRef.current?.focus({ preventScroll: true });

    // A row low in the list opens its panel below the fold, and nothing scrolls
    // it into view on its own. Timing this against the expand animation is not
    // possible by listening for it: grid-template-rows animates without ever
    // firing transitionend. So watch the panel's box instead and keep it in
    // view as it grows — no dependency on the duration in globals.css.
    const panel = panelRef.current;
    if (!panel) return;

    const follow = () => panel.scrollIntoView({ block: "nearest" });
    follow();

    const ro = new ResizeObserver(follow);
    ro.observe(panel);
    // Long enough to cover the expand, short enough not to fight the reader.
    const stop = setTimeout(() => ro.disconnect(), 500);
    return () => {
      ro.disconnect();
      clearTimeout(stop);
    };
  }, [opened, shut]);

  const cls = [opened ? "open2" : "", shut ? "done" : "", justWon ? "new" : ""]
    .join(" ")
    .trim();

  return (
    <li className={cls}>
      <button className="row" type="button" onClick={onToggle} aria-expanded={opened}>
        <span className="when">{when(item.date)}</span>
        <span className="t">
          {item.what}
          {item.move.trim() && <em>I could {lowerFirst(item.move.trim())}</em>}
          {kept > 0 && (
            <em className="k">
              +{m(kept)} saved
              {item.who.trim() ? ` · ${item.who.trim()}` : ""}
            </em>
          )}
        </span>
        <span className={`u${shut ? " paid" : ""}`}>
          {shut ? m(item.spent!) : `${m(item.usual)} usual`}
        </span>
      </button>

      {/* Always in the DOM so the row can animate open; inert keeps the
          collapsed fields out of the tab order. */}
      <div className="panel" ref={panelRef} inert={!opened}>
        <div>
          <div className="inner">
            <div>
              <label htmlFor={`s-${item.id}`}>What did it actually cost?</label>
              <MoneyInput
                id={`s-${item.id}`}
                ref={spentRef}
                placeholder="$0"
                value={spent}
                onValueChange={setSpent}
              />
            </div>

            <div>
              <label htmlFor={`m-${item.id}`}>Instead, I could&hellip;</label>
              <input
                id={`m-${item.id}`}
                type="text"
                placeholder="buy a pint and sugar cones"
                value={move}
                onChange={(e) => {
                  setMove(e.target.value);
                  onMove(e.target.value);
                }}
              />
            </div>

            {shut && (
              <div>
                <label>Who?</label>
                <WhoPicker
                  value={who}
                  onChange={(names) => {
                    // Live, not on blur: the tally at the bottom of the list
                    // moves as you tap. That is the payoff.
                    setWho(names);
                    onWho(formatWho(names));
                  }}
                />
              </div>
            )}

            <button
              className="go"
              type="button"
              onClick={() => {
                if (!rawMoney(spent)) return spentRef.current?.focus();
                onCloseOut(numMoney(spent));
              }}
            >
              {shut ? "Update" : "Close it out"}
            </button>

            <button className="drop" type="button" onClick={onRemove}>
              {shut ? "Remove" : "Didn’t happen — remove"}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
