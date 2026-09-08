# Step Up

**Problem**

Our family decides to spend money in the moment — threading on Monday, dinner
with Supriya on Thursday, snacks for the girls on Friday — and each decision is
made and gone before anyone weighs it. The ask that started this was "a super
simple expense tracker for my family… set date, activity and expected cost…
update for actual cost," and the prototype that came back rejected its own
premise: recording what a thing cost does not change whether you buy it. The
only moment worth catching is the one before, while a cheaper version of the
same Thursday is still on the table.

**Vision**

Before the money moves, the cheaper version of the plan is already written
down — and whoever takes it gets the credit.

**Principles**

- **The alternative over the total.** Writing "fruit and pancakes at home" next
  to a $50 plan changes what you do; a running balance does not. This costs us
  budgets, forecasts, and categories, and we will not ship them.
- **Wins over damage.** Savings floor at zero — going over is never negative
  savings. Overspend earns one grey sentence at the bottom of the list and
  nothing more. We give up honest accounting to keep the app worth opening.
- **A name over a number.** The only scoreboard is who kept what. There is no
  grand total of savings anywhere in the product, on purpose: a pot is nobody's,
  and nobody is proud of a pot.

**Goals**

Output metric: dollars kept — usual minus actual across closed items. Measured,
and deliberately never shown as a single number (see principles).

Inputs
- % of planned items that name an alternative — the field doing the work is
  optional, so this is the adoption number that actually matters
- % of planned items that ever get closed out — an item nobody closes is
  invisible money and a dead row
- % of closed items that came in under usual — its complement is literally the
  app's own quiet line, "N closed at or above usual"
- % of kept dollars credited to a person rather than sitting unassigned

**Solution**

*Plan it, and write down the other option*

Four fields: what's coming up, what it usually costs, when, and "Instead, I
could…". The fourth is the product; the first three exist to give it something
to hang on. It is optional, and the form says underneath it, "You are not
committing to this. Just think about it." A promise is the thing people avoid
an app to escape. A thought is not.

*Close it out and watch it leave*

Afterward you tap the row and enter what it actually cost. The item drops out of
the planned pile into the closed list below, and if you came in under, the row
gains "+$47.50 saved" and glows once. This is the only reward loop in the app.
Nothing else animates.

*Put a name on it*

Only once something is closed does the app ask "Who?". The tally at the bottom —
"Who kept what · Cecilia $47.50" — appears only after at least one person is
named; money nobody claims shows as "unassigned" beside them and never on its
own. Credit is opt-in, and the ledger is made of people or it isn't shown.

*One button and two numbers*

Home is the "Plan something" button, and under a rule, "3 planned, $180 / 2
closed, $41.50" — what is still ahead and what has actually left. The entire
list sits one tap behind that. Anyone who wants a real ledger gets "Copy for
spreadsheet," which puts every row on the clipboard as tab-separated columns and
hands the problem to Sheets.

**What We're Not Prioritizing**

- Accounts, logins, per-person balances, or anyone owing anyone. One URL, one
  shared list, a family.
- Budgets, categories, charts, trends, and any grand total of savings. The named
  tally is the whole scoreboard.
- Editing a plan after you make it. What, how much, when, and the alternative are
  fixed at creation; only the outcome is recordable. A plan that was wrong gets
  removed — "Didn't happen — remove" — not corrected.
- Due dates, reminders, overdue states. An item whose date has passed looks
  exactly like one next week. The app never nags; it is opened on purpose or not
  at all.

**Tech**

Next.js (App Router) on Vercel, free tier. Neon free Postgres, one `items`
table, no auth — the connection string is server-only by nature and every write
goes through a Next.js server action, so the browser never holds a credential.
Nothing else connects: no Stripe, no email, no third-party API. Installed to the
home screen rather than bookmarked.

The prototype is the source of truth for the UX and nothing else; its
`localStorage` was a prototype's convenience, and a family list that lives in one
browser is not a family list.

**Use Cases**

- Threading, $50, "do it at home." Nothing is promised. On the 7th she does it
  at home and closes it out at $0 — the row reads +$50 saved and drops down the
  list.
- Dinner with Supriya was planned at $80 and became coffee at $32.50. Closed
  out, +$47.50 saved, credited to Cecilia — and the tally appears at the bottom
  for the first time.
- The coffee run was planned at $24 and cost $9. It sits below the planned
  items, done, $15 kept against it and nobody's. It stays invisible in aggregate
  until Cecilia is named on some other row, and only then joins the tally as
  "unassigned $15".
- Snacks for the girls was planned at $50 and cost $62. It closes, shows $62, and
  earns no savings line at all. The bottom of the list says "1 closed at or above
  usual." Nothing else happens to it, ever.
