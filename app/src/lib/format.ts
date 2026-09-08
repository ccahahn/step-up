/** $50, $9.50 — trailing .00 dropped, the way the prototype writes money. */
export function m(n: number): string {
  return "$" + Number(n).toFixed(2).replace(/\.00$/, "");
}

/** "2026-09-07" -> "Sep 7". Split by hand; `new Date(iso)` would shift the day. */
export function when(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Today, local zone, as YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Strip everything but digits and one dot, cap at two decimals. */
export function rawMoney(v: string): string {
  const cleaned = v.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length === 1) return cleaned;
  return parts[0] + "." + parts.slice(1).join("").slice(0, 2);
}

/** What the money inputs display while you type: "" or "$12.5". */
export function maskMoney(v: string): string {
  const r = rawMoney(v);
  return r === "" ? "" : "$" + r;
}

export function numMoney(v: string): number {
  return parseFloat(rawMoney(v)) || 0;
}

/**
 * "Buy a pint" -> "buy a pint", so the alternative joins "I could …" as one
 * sentence however it was typed. Acronyms are left alone: "DIY it at home"
 * would otherwise become "dIY it at home".
 *
 * Display only — the stored text and the spreadsheet export keep what you typed.
 */
export function lowerFirst(s: string): string {
  const first = s.split(/\s/, 1)[0] ?? "";
  const isAcronym =
    first.length > 1 && /[A-Z]/.test(first) && first === first.toUpperCase();
  return isAcronym ? s : s.charAt(0).toLowerCase() + s.slice(1);
}
