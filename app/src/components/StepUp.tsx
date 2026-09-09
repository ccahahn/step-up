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
  setMoveAction,
  setWhoAction,
} from "@/app/actions";
import type { Result } from "@/app/actions";
import { saved, type Item } from "@/lib/types";

type View = "home" | "plan" | "open";

export default function StepUp({
  initial,
  shared,
  initialError = null,
}: {
  initial: Item[];
  shared: boolean;
  initialError?: string | null;
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const [view, setView] = useState<View>("home");
  const [opened, setOpened] = useState<string | null>(null);
  const [justWon, setJustWon] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(initialError);

  // Number of writes in flight. A refresh while one is pending would hand back
  // the pre-write rows and undo what you just did on screen.
  const inFlight = useRef(0);

  // One debounce timer per field per row, so editing two things at once — or
  // two rows — does not cancel either.
  const liveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const go = (v: View) => {
    if (v !== "open") setOpened(null);
    setView(v);
    window.scrollTo(0, 0);
  };

  /** Paint the change now, persist behind it, put it back if the write fails. */
  const persist = useCallback(
    (next: Item[], write: () => Promise<Result>) => {
      const before = items;
      setItems(next);
      inFlight.current += 1;
      write()
        .then((r) => {
          if (r.ok) return setProblem(null);
          setItems(before);
          setProblem(r.error);
        })
        .catch((e) => {
          setItems(before);
          setProblem(e instanceof Error ? e.message : String(e));
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
      const r = await refreshAction();
      if (!r.ok) return setProblem(r.error);
      setItems(r.items);
      setProblem(null);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : String(e));
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

  /**
   * Edited a character or a tap at a time: paint every change and let the write
   * settle behind it. No rollback here on purpose — yanking half-typed text out
   * from under someone is worse than a stale write, and the banner covers it.
   */
  const liveEdit = useCallback(
    (key: string, apply: (cur: Item[]) => Item[], write: () => Promise<Result>) => {
      setItems(apply);

      const timers = liveTimers.current;
      if (timers.has(key)) clearTimeout(timers.get(key)!);
      else inFlight.current += 1; // held until this field's write lands

      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          write()
            .then((r) => setProblem(r.ok ? null : r.error))
            .catch((e) => setProblem(e instanceof Error ? e.message : String(e)))
            .finally(() => {
              inFlight.current -= 1;
            });
        }, 500),
      );
    },
    [],
  );

  function setWho(id: string, who: string) {
    liveEdit(
      `who:${id}`,
      (cur) => cur.map((i) => (i.id === id ? { ...i, who } : i)),
      () => setWhoAction(id, who),
    );
  }

  function setMove(id: string, move: string) {
    liveEdit(
      `move:${id}`,
      (cur) => cur.map((i) => (i.id === id ? { ...i, move } : i)),
      () => setMoveAction(id, move),
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
          <span className="why">{problem}</span>
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
          onMove={setMove}
          onWho={setWho}
          onRemove={remove}
          onBack={() => go("home")}
        />
      )}
    </>
  );
}
