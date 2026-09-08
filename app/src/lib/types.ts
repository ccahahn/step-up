export type Item = {
  id: string;
  /** ISO date, YYYY-MM-DD. A plain date, never a timestamp — no zone shifts. */
  date: string;
  /** "Threading" */
  what: string;
  /** What it usually costs. */
  usual: number;
  /** null while it is still planned. A number means it is closed out. */
  spent: number | null;
  /** "Instead, I could do it at home" — the alternative, not a commitment. */
  move: string;
  /** Who kept the difference. */
  who: string;
  created_at: string;
};

/** Still ahead of us. */
export const isOpen = (i: Item) => i.spent === null || Number.isNaN(i.spent);

/** What the swap kept. Never negative — going over is not negative savings. */
export const saved = (i: Item) => Math.max(0, i.usual - (i.spent ?? 0));
