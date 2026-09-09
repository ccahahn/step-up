"use client";

import { useState } from "react";
import { PEOPLE, customOf, isPreset } from "@/lib/people";

/**
 * Tap-to-credit. Several people can keep the same saving, but there is only
 * ever one free-typed name — the presets cover the family, and Other is for
 * the occasional guest rather than a second list.
 */
export default function WhoPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (names: string[]) => void;
}) {
  const custom = customOf(value);
  const [otherOn, setOtherOn] = useState(custom !== null);
  const [otherText, setOtherText] = useState(custom ?? "");

  const presets = value.filter(isPreset);

  function emit(nextPresets: string[], nextCustom: string) {
    const name = nextCustom.trim();
    onChange(name ? [...nextPresets, name] : nextPresets);
  }

  function togglePreset(p: string) {
    const next = presets.includes(p)
      ? presets.filter((x) => x !== p)
      : [...presets, p];
    // Keep the family in list order rather than tap order.
    emit(PEOPLE.filter((x) => next.includes(x)), otherOn ? otherText : "");
  }

  function toggleOther() {
    if (otherOn) {
      setOtherOn(false);
      setOtherText("");
      emit(presets, "");
    } else {
      setOtherOn(true);
    }
  }

  return (
    <div className="who">
      <div className="chips">
        {PEOPLE.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={presets.includes(p)}
            className={`chip${presets.includes(p) ? " on" : ""}`}
            onClick={() => togglePreset(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={otherOn}
          className={`chip${otherOn ? " on" : ""}`}
          onClick={toggleOther}
        >
          Other
        </button>
      </div>

      {otherOn && (
        <input
          type="text"
          className="other"
          placeholder="Who else?"
          aria-label="Other name"
          autoFocus
          value={otherText}
          onChange={(e) => {
            const v = e.target.value.replace(/,/g, "");
            setOtherText(v);
            emit(presets, v);
          }}
        />
      )}
    </div>
  );
}
