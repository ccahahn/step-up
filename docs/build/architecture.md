# Step Up architecture

Scope of this build: the whole thing. Plan something, close it out, see who
kept what. One shared list, no accounts, installed on the family's phones.

`thinking/family-ledger.html` is a working prototype and it is authoritative
**for the UX only** — the screens, the copy, the interaction, the palette. Its
CSS is ported verbatim into `globals.css` rather than retranslated, so the
prototype stays the place the design is decided. Nothing about the stack comes
from it; its `localStorage` was a prototype's convenience, not a decision.

## Palette

Dark surface, one vivid pink. `--bg #0B0C0E`, cards `#16181C`, rules
`#262A31`, accent `#FF4FA3` with a soft `#FF9BC8` for the "I could" line and a
gradient for the primary buttons. Defined once as CSS variables at the top of
`globals.css`.

Dark only, deliberately — it is a phone app you open at night while planning
the week, and the pink is doing the emotional work. There is no light theme to
keep in sync.

Type is Instrument Sans via `next/font/google`, self-hosted at build so there
is no external font request. `font-variant-numeric: tabular-nums` on the body
keeps money columns from dancing.

## Stack

Next.js 16 (App Router), React 19, TypeScript. No Tailwind — the prototype's
stylesheet is the design system. Neon serverless Postgres over HTTP. Deploys to
Vercel free tier.

```
app/
  src/app/
    page.tsx          server component, reads the list, hands it to StepUp
    actions.ts        server actions — the only things that write
    layout.tsx        font, install metadata, the 400px .wrap
    globals.css       the prototype's CSS, ported
    manifest.ts       Android install
    icon.png          512, generated — see data/make-icons.py
    apple-icon.png    180, the home screen icon
    favicon.ico       16/32/48
  src/components/
    StepUp.tsx        the shell: owns items, the view, optimistic writes
    Home.tsx          "Plan something" + the two counts
    Plan.tsx          the four-field form
    OpenList.tsx      the list, the who-kept-what tally, the TSV export
    Row.tsx           one item and its accordion panel
    MoneyInput.tsx    masks to "$12.50" as you type
  src/lib/
    store.ts          the only file that touches storage
    types.ts          Item, isOpen(), saved()
    format.ts         money, dates, the input mask, lowerFirst()
data/
  schema.sql          run once in the Neon SQL editor
  seed.sql            optional starter rows
  mobile-icon.png     source art for the icon
  make-icons.py       crops it and writes the three app icons
  local.json          generated in dev only, gitignored
```

## Storage

`src/lib/store.ts` is the seam. If `DATABASE_URL` is set it talks to Neon; if
it is not it reads and writes `data/local.json`. That means `npm run dev` works
with nothing configured, and the fallback is dev-only by construction —
Vercel's filesystem is read-only at runtime, so a deploy missing its env var
fails visibly on the first write rather than silently losing data.

One table, `items`. `spent` is nullable and that null is the entire state
machine: null means still ahead of us, a number means closed out. There is no
status column to keep in sync.

No RLS, no policies. Nothing but the server ever holds the connection string —
the browser bundle contains no database client — so the table has exactly one
client and row-level rules would be describing a boundary that isn't there.
Anyone with the app's URL can read and write the family list, which is the
intended design: it is a family, not a tenant.

Dates are read back with `to_char(date, 'YYYY-MM-DD')` rather than as the raw
column. The driver would otherwise hand back a JS `Date` in the server's zone
and "2026-09-07" could arrive as the 6th.

## Writes

The prototype felt instant because everything was local. Server actions are
not, so `StepUp.tsx` paints the change first and persists behind it:

```
persist(nextItems, () => someAction(...))
  set state now
  await the action
  on failure: put the old state back, show the banner
```

Ids are minted client-side with `crypto.randomUUID()` so a new row can appear
before the round trip, and the insert is `on conflict do nothing` so a retry
cannot double-add.

`inFlight` counts pending writes. The window-focus refresh — which is how a
second phone picks up what the first one did — skips while anything is in
flight, because refetching mid-write would hand back the pre-write rows and
visibly undo what you just tapped.

The `who` field is the exception: it saves on every keystroke, debounced 500ms
per row, and does not roll back on failure. The tally at the bottom of the list
counting up as you type your name is the payoff, and yanking a half-typed name
out from under someone is worse than a stale write. The banner covers it.

## Installed, not bookmarked

`layout.tsx` declares `viewport-fit=cover`, `apple-mobile-web-app-capable`, and
a translucent status bar, so Add to Home Screen launches without browser
chrome. That removes the chrome that was insetting the content, so `.wrap`
clears the notch and the home indicator itself:

```
padding-top:    calc(72px + env(safe-area-inset-top,0px))
padding-bottom: calc(60px + env(safe-area-inset-bottom,0px))
```

In Safari those insets are zero and it is plain 72/60. Without
`viewport-fit=cover` they would be zero everywhere, including standalone, which
is the trap.

Icons come from `data/mobile-icon.png` through `data/make-icons.py`. The source
is a rounded black square on white; iOS masks with its own squircle, so the
script crops to the artwork and repaints the leftover corners black. Shipping
the source as-is gives a white frame around a double-rounded square.

## Flow

```
Home                       Plan something ──► Plan ──► saves ──► Home
  │  N planned, $X
  │  N closed, $Y
  └──────────────► List    tap a row ──► panel opens
                              │            what did it actually cost?
                              │            who? (only once it is closed)
                              ├─ Close it out ─► drops to the closed
                              │                  section, +$X saved
                              └─ Didn't happen — remove
                            Who kept what · Cecilia $47.50
                            Copy for spreadsheet ──► TSV to clipboard
```

Open items sort by date at the top, closed ones by date underneath. Closing
something moves it down the list — the reward is watching it leave the "still
ahead of us" pile.

## Three details worth keeping

`saved()` floors at zero. Going over does not produce negative savings; those
rows are counted separately in the quiet "N closed at or above usual" line.
The tally is for wins, and a win that can be cancelled out by a loss elsewhere
stops being motivating.

`lowerFirst()` lowercases the alternative on render so "Buy a pint" joins
"I could …" as one sentence. It skips all-caps first words, so "DIY it at home"
survives. Display only — the stored text and the TSV export keep what was typed.

The clipboard write races a 500ms timeout before falling back to
`execCommand`. Chrome leaves `navigator.clipboard.writeText` pending forever
when the tab is not focused, so without the race the button just never says
anything.
