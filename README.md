# Antonio's Cucina Italiana — Website

A recreation of the site from your screen recording: a two-page static site
(home + full ordering menu) in plain HTML/CSS/JS — no build step required.

## Structure

```
antonios-cucina/
├── index.html          # Home page (hero, features, reviews, visit-us, footer)
├── menu.html           # Full menu with category tabs (renders from menu-data.js)
├── assets/
│   ├── css/
│   │   ├── style.css   # Shared tokens, header, footer, buttons
│   │   ├── home.css    # Home page sections
│   │   └── menu.css    # Menu page / tabs / item cards
│   ├── js/
│   │   ├── menu-data.js   # ← EDIT THIS to change items/prices/categories
│   │   ├── menu.js        # Renders tabs + item cards from menu-data.js
│   │   └── cart.js        # Simple localStorage cart + floating cart button
│   └── img/             # Placeholder images — swap these for real photos
```

## Running it locally

No build tools needed. Either:

- Open `index.html` directly in a browser, or
- Serve it (recommended, avoids `file://` quirks):
  ```bash
  cd antonios-cucina
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

## Using this with Claude Code

1. Copy this whole folder into a new (or existing) git repo.
2. Open it in Claude Code: `claude` from inside the project directory.
3. Good next prompts:
   - "Add real photos to assets/img and update the image paths"
   - "Wire up menu.html's Add buttons to a real cart page / checkout flow"
   - "Add a mobile hamburger menu for the header nav"
   - "Convert this to Next.js" (if you want a framework instead of static HTML)
   - "Add the pizza items I'm missing — here's the rest of the list: ..."

## Menu data

Everything on `menu.html` is generated from `assets/js/menu-data.js`. To add,
remove, or reprice an item, edit that file — the tabs and cards render
automatically. Sized items (like pizza) use a `prices: {}` object; flat-price
items use a single `price` number.

## Known gaps to fill in

- I only had the items visible in your recording (11 pizzas, all specialty
  pasta/marinara/alfredo/salads/appetizers/subs/burgers/desserts/drinks). If
  your real menu has more items or a "Pizza Ricardo" description that got cut
  off on screen, add them in `menu-data.js`.
- Photos in `assets/img/` are labeled placeholders — drop in your real photos
  with the same filenames and they'll appear automatically.
- The cart is a simple localStorage counter for now, not a real checkout —
  good candidate for your first Claude Code session on this project.
