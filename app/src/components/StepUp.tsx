"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Home from "./Home";
import OpenList from "./OpenList";
import Plan, { type Draft } from "./Plan";
import {
  addItemAction,
  closeOutAction,
  refreshAction,
  removeItemAction,
  setWhoAction,
} from "@/app/actions";
import { saved, type Item } from "@/lib/types";

type View = "home" | "plan" | "open";

export default function StepUp({
  initial,
  shared,
}: {
  initial: Item[];
  shared: boolean;
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const [view, setView] = useState<View>("home");
  const [opened, setOpened] = useState<string | null>(null);
  const [justWon, setJustWon] = useState<string | null>(null);
  const [problem, setProblem] = useState(false);

  // Number of writes in flight. A refresh while one is pending would hand back
  // the pre-write rows and undo what you just did on screen.
  const inFlight = useRef(0);

  // One debounce timer per row, so two people's names do not cancel each other.
  const whoTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const go = (v: View) => {
    if (v !== "open") setOpened(null);
    setView(v);
    window.scrollTo(0, 0);
  };

  /** Paint the change now, persist behind it, put it back if the write fails. */
  const persist = useCallback(
    (next: Item[], write: () => Promise<void>) => {
      const before = items;
      setItems(next);
      inFlight.current += 1;
      write()
        .then(() => setProblem(false))
        .catch(() => {
          setItems(before);
          setProblem(true);
        })
        .finally(() => {
          inFlight.current -= 1;
        });
    },
    [items],
  );

  const reload = useCallback(async () => {
    if (inFlight.current > 0) return;
    try {
      setItems(await refreshAction());
      setProblem(false);
    } catch {
      setProblem(true);
    }
  }, []);

  // Someone else's phone may have closed something out. Pick it up on return.
  useEffect(() => {
    if (!shared) return;
    const onFocus = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [shared, reload]);

  function plan(d: Draft) {
    const row: Omit<Item, "created_at"> = {
      id: crypto.randomUUID(),
      date: d.date,
      what: d.what,
      usual: d.usual,
      spent: null,
      move: d.move,
      who: "",
    };
    persist([...items, { ...row, created_at: new Date().toISOString() }], () =>
      addItemAction(row),
    );
    go("home");
  }

  function closeOut(id: string, spent: number) {
    const next = items.map((i) => (i.id === id ? { ...i, spent } : i));
    persist(next, () => closeOutAction(id, spent));

    const row = next.find((i) => i.id === id)!;
    setOpened(null);
    if (saved(row) > 0) {
      setJustWon(id);
      setTimeout(() => setJustWon(null), 1800);
    }
  }

  // Typed a character at a time, so paint every keystroke and let the write
  // settle. No rollback here on purpose — losing a half-typed name to a failed
  // request would yank the field out from under the person typing it; the
  // banner tells them instead.
  function setWho(id: string, who: string) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, who } : i)));

    const timers = whoTimers.current;
    if (timers.has(id)) clearTimeout(timers.get(id)!);
    else inFlight.current += 1; // held until this id's write lands

    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        setWhoAction(id, who)
          .then(() => setProblem(false))
          .catch(() => setProblem(true))
          .finally(() => {
            inFlight.current -= 1;
          });
      }, 500),
    );
  }

  function remove(id: string) {
    setOpened(null);
    persist(
      items.filter((i) => i.id !== id),
      () => removeItemAction(id),
    );
  }

  return (
    <>
      {problem && (
        <p className="oops">
          That didn&rsquo;t save — the list on screen may be behind.
          <button type="button" onClick={reload}>
            Try again
          </button>
        </p>
      )}

      {view === "home" && (
        <Home
          items={items}
          onPlan={() => go("plan")}
          onOpen={() => go("open")}
        />
      )}

      {view === "plan" && <Plan onSave={plan} onBack={() => go("home")} />}

      {view === "open" && (
        <OpenList
          items={items}
          opened={opened}
          justWon={justWon}
          onToggle={(id) => setOpened((cur) => (cur === id ? null : id))}
          onCloseOut={closeOut}
          onWho={setWho}
          onRemove={remove}
          onBack={() => go("home")}
        />
      )}
    </>
  );
}
