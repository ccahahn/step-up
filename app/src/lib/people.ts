/** The family. Edit this list to change the buttons. */
export const PEOPLE = ["Papa", "Mama", "Izzy", "Ada"] as const;

// `who` stays a single text column — several names live in it comma-separated,
// so adding this needed no migration against the deployed database. Names
// therefore cannot contain a comma; the picker strips them on the way in.

export function parseWho(who: string): string[] {
  return who
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatWho(names: string[]): string {
  return names.join(", ");
}

export const isPreset = (name: string): boolean =>
  (PEOPLE as readonly string[]).includes(name);

/** Anything not on the list is the one free-typed name. */
export const customOf = (names: string[]): string | null =>
  names.find((n) => !isPreset(n)) ?? null;
