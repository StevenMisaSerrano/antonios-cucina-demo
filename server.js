require("dotenv").config();

const express = require("express");
const path = require("path");
const Stripe = require("stripe");
const MENU = require("./assets/js/menu-data.js");

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY is not set. Copy .env.example to .env and add your Stripe TEST secret key.\n" +
      "   Checkout requests will fail until you do."
  );
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing");
const app = express();
const PORT = process.env.PORT || 4242;

app.use(express.json());
app.use(express.static(__dirname));

// Looks up the trusted price for a menu item server-side. Never trust a
// price sent by the client — this is what stops someone from tampering
// with the request and checking out a $30 pizza for $1.
function findUnitPrice(name, size) {
  for (const categoryKey of Object.keys(MENU)) {
    const item = MENU[categoryKey].items.find((i) => i.name === name);
    if (!item) continue;
    if (item.prices) {
      return typeof size === "string" && item.prices[size] != null ? item.prices[size] : null;
    }
    return item.price;
  }
  return null;
}

app.post("/create-checkout-session", async (req, res) => {
  const cartItems = Array.isArray(req.body.items) ? req.body.items : [];

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  const line_items = [];
  for (const entry of cartItems) {
    const unitPrice = findUnitPrice(entry.name, entry.size);
    if (unitPrice == null) {
      return res.status(400).json({ error: `"${entry.name}" isn't a valid menu item.` });
    }
    const quantity = Math.max(1, Math.min(50, parseInt(entry.qty, 10) || 1));
    line_items.push({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(unitPrice * 100),
        product_data: {
          name: entry.size ? `${entry.name} (${entry.size})` : entry.name
        }
      }
    });
  }

  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Could not start checkout. Check the server logs and your Stripe test key." });
  }
});

app.listen(PORT, () => {
  console.log(`Antonio's Cucina running at http://localhost:${PORT}`);
});
