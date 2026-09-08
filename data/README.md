# data

| file              | what it is                                                    |
| ----------------- | ------------------------------------------------------------- |
| `schema.sql`      | Run once in the Neon SQL editor. One table, `items`.           |
| `seed.sql`        | Optional four starter rows.                                    |
| `mobile-icon.png` | Source art for the app icon. Square, any size.                 |
| `make-icons.py`   | Turns that into the app's icons. Re-run after replacing it.    |
| `local.json`      | Generated. Dev-only store when `DATABASE_URL` is unset.        |

## Replacing the icon

Drop a new square image in as `mobile-icon.png`, then:

```
python3 data/make-icons.py
```

It writes `app/src/app/icon.png`, `apple-icon.png`, and `favicon.ico`, which
Next.js picks up by filename — no code change needed. A white margin and
pre-rounded corners in the source are handled; see the script's docstring for
why that matters on iOS.
