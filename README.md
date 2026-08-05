# Antonio's Cucina Italiana — Website

A recreation of the site from your screen recording: a two-page site
(home + full ordering menu) in plain HTML/CSS/JS, with a small Node server
that wires the cart up to Stripe Checkout in test mode.

## Structure

```
antonios-cucina/
├── index.html          # Home page (hero, features, reviews, visit-us, footer)
├── menu.html           # Full menu with category tabs (renders from menu-data.js)
├── success.html        # Stripe Checkout success_url landing page
├── cancel.html         # Stripe Checkout cancel_url landing page
├── server.js           # Express server: static files + /create-checkout-session
├── package.json
├── .env.example         # Copy to .env and add your Stripe TEST secret key
├── assets/
│   ├── css/
│   │   ├── style.css   # Shared tokens, header, footer, buttons, cart drawer
│   │   ├── home.css    # Home page sections
│   │   └── menu.css    # Menu page / tabs / item cards
│   ├── js/
│   │   ├── menu-data.js   # ← EDIT THIS to change items/prices/categories
│   │   │                    (also required by server.js to validate prices)
│   │   ├── menu.js        # Renders tabs + item cards from menu-data.js
│   │   └── cart.js        # Cart state, drawer UI, Stripe Checkout handoff
│   └── img/             # Placeholder images — swap these for real photos
```

## Running it locally

**Just previewing the pages (no checkout)?** No build tools needed:
```bash
cd antonios-cucina
python3 -m http.server 8000
# then visit http://localhost:8000
```
The Checkout button will show a friendly error in this mode — it needs the
Node server below to actually create a Stripe session.

**With working checkout:**
```bash
cd antonios-cucina
npm install
cp .env.example .env        # then paste your Stripe TEST secret key into .env
npm start
# then visit http://localhost:4242
```

## Using this with Claude Code

1. Copy this whole folder into a new (or existing) git repo.
2. Open it in Claude Code: `claude` from inside the project directory.
3. Good next prompts:
   - "Add a Stripe webhook that emails the kitchen when an order comes in"
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
- Photos in `assets/img/` are now free-to-use stock photos (Pexels License —
  free for commercial use, no attribution required) standing in for real
  photos of the restaurant. Swap in the owner's actual photos with the same
  filenames whenever they're available. Source photos, for reference:
  - `hero.jpg` — pexels.com/photo/5848160
  - `pizza-hero.jpg` / `featured-pizza.jpg` — pexels.com/photo/31596394
  - `pasta-hero.jpg` / `featured-alfredo.jpg` — pexels.com/photo/31269836
  - `salad-hero.jpg` / `featured-salad.jpg` — pexels.com/photo/33158331
  - `dining-room.jpg` — pexels.com/photo/14590691
- See "Checkout (Stripe, test mode)" below for what's wired up and what
  still needs to happen before this could take real orders.

## Checkout (Stripe, test mode)

Clicking **View Cart** opens a drawer with the itemized order, quantity
controls, and a running total. **Checkout** POSTs the cart to the local
server, which creates a [Stripe Checkout](https://stripe.com/docs/payments/checkout)
Session and redirects the browser to Stripe's hosted payment page. Card
numbers are entered on Stripe's page, never on this site.

- The server (`server.js`) re-looks-up every item's price from
  `menu-data.js` before creating the session — it never trusts a price sent
  by the browser, so someone can't tamper with the request to pay less.
- Use [Stripe's test card](https://stripe.com/docs/testing) `4242 4242 4242 4242`,
  any future expiry, any CVC, any ZIP to complete a test payment.
- On success, Stripe redirects to `success.html`, which clears the local
  cart. On cancel, it redirects to `cancel.html` and the cart is left as-is.
- All of this runs against your Stripe account's **test mode** — the keys
  starting `sk_test_...` — so nothing here moves real money.

### Before this can go live for a real restaurant

1. **Swap in live API keys.** Test keys (`sk_test_...`) only work with
   Stripe's test mode. You'd create a live-mode key
   (`sk_live_...`) in the Stripe Dashboard and set it as `STRIPE_SECRET_KEY`
   in production — never commit it, and never reuse a test key in production.
2. **Add a webhook for order fulfillment.** Right now, nothing actually
   happens after a successful payment except showing `success.html` — no
   ticket reaches the kitchen. A production build needs a
   `checkout.session.completed` webhook
   (https://stripe.com/docs/webhooks) that verifies the event signature and
   then emails/prints/pushes the order somewhere a human or POS system will
   see it. Don't rely on the success redirect alone for fulfillment — a
   customer closing the tab before the redirect completes would mean a paid
   order nobody sees.
3. **Serve over HTTPS on a real domain.** Stripe requires HTTPS in live
   mode, and `success_url`/`cancel_url` need to point at that real domain
   instead of `localhost`.
4. **Decide how sales tax is handled** — either enable
   [Stripe Tax](https://stripe.com/tax) on the Checkout Session or compute
   it yourself before creating line items.
5. **Add basic rate limiting / abuse protection** on
   `/create-checkout-session` — it's currently open to anyone who can reach
   the server.
6. **Persist orders somewhere** (a database, an order-management tool) —
   right now a completed order only exists inside Stripe's dashboard.
