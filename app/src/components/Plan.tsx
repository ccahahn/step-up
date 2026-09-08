"use client";

import { useState } from "react";
import MoneyInput from "./MoneyInput";
import { numMoney, rawMoney, todayISO } from "@/lib/format";

export type Draft = { date: string; what: string; usual: number; move: string };

export default function Plan({
  onSave,
  onBack,
}: {
  onSave: (d: Draft) => void;
  onBack: () => void;
}) {
  const [what, setWhat] = useState("");
  const [usual, setUsual] = useState("");
  const [date, setDate] = useState(todayISO);
  const [move, setMove] = useState("");

  return (
    <section>
      <button className="back" type="button" onClick={onBack}>
        &#8592; Back
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!what.trim() || !rawMoney(usual)) return;
          onSave({
            date,
            what: what.trim(),
            usual: numMoney(usual),
            move: move.trim(),
          });
        }}
      >
        <div>
          <label htmlFor="fWhat">What&rsquo;s coming up?</label>
          <input
            id="fWhat"
            type="text"
            placeholder="Bacio di Latte"
            required
            autoFocus
            value={what}
            onChange={(e) => setWhat(e.target.value)}
          />
        </div>

        <div className="pair">
          <div>
            <label htmlFor="fUsual">What it usually costs</label>
            <MoneyInput
              id="fUsual"
              placeholder="$0"
              required
              value={usual}
              onValueChange={setUsual}
            />
          </div>
          <div>
            <label htmlFor="fDate">When</label>
            <input
              id="fDate"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="fMove">Instead, I could&hellip;</label>
          <input
            id="fMove"
            type="text"
            placeholder="buy a pint and sugar cones"
            value={move}
            onChange={(e) => setMove(e.target.value)}
          />
          <p className="hint">
            You are not committing to this. Just think about it.
          </p>
        </div>

        <button className="go" type="submit">
          Plan it
        </button>
      </form>
    </section>
  );
}
