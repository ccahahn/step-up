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
  onWho,
  onRemove,
}: {
  item: Item;
  opened: boolean;
  justWon: boolean;
  onToggle: () => void;
  onCloseOut: (spent: number) => void;
  onWho: (who: string) => void;
  onRemove: () => void;
}) {
  const shut = !isOpen(item);
  const kept = shut ? saved(item) : 0;

  const [spent, setSpent] = useState(shut ? m(item.spent!) : "");
  const [who, setWho] = useState<string[]>(parseWho(item.who ?? ""));
  const spentRef = useRef<HTMLInputElement>(null);

  // The panel is open — put the cursor where the one number goes.
  useEffect(() => {
    if (opened) spentRef.current?.focus();
  }, [opened]);

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
      <div className="panel" inert={!opened}>
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
