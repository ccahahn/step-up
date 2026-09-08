# Step Up

Plan what's coming up, name what you could do instead, then keep the
difference. One shared list for the family, no accounts.

- Strategy — `docs/strategy/spec.md`
- How it's built — `docs/build/architecture.md`
- The prototype the UX came from — `thinking/family-ledger.html`

## Run it locally

```
cd app
npm install
npm run dev
```

With no database configured it reads and writes `data/local.json`, so this
works immediately. That file is dev-only scratch data and is gitignored.

## Put it online (free)

**1. Neon** — neon.tech, new project, free tier.

- SQL Editor → paste `data/schema.sql` → Run.
- Optionally paste `data/seed.sql` too, for the four starter rows.
- Copy the **pooled** connection string from the project dashboard.

**2. Vercel** — vercel.com, import this repo.

- Set **Root Directory** to `app`.
- Environment Variable: `DATABASE_URL` — the Neon connection string.
- Deploy.

Both free tiers are enough for a family. Neon suspends a free branch after a
few minutes idle and wakes it on the next query, so the first open of the day
is a beat slower; nothing is lost.

Then add it to everyone's home screen. There is no login: anyone with the link
can read and edit the list, which is the point. Don't post it publicly.

## Add to Home Screen

The app is built to be installed, not bookmarked — it launches without browser
chrome, under a translucent status bar, with the lotus icon and the name
"Step Up".

- **iPhone** — open the URL in Safari, Share → Add to Home Screen.
- **Android** — Chrome will offer Install.

The icon comes from `data/mobile-icon.png`. To change it, drop in a new square
image and re-run the crop-and-resize in `data/README.md`.

## Exporting

"Copy for spreadsheet" on the list puts every row on the clipboard as
tab-separated columns — Date, What, Usual, Actual, Saved, Instead I could,
Who, Status. Paste straight into Sheets or Excel.
