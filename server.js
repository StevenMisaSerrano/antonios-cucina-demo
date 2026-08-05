require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");
const { createCheckoutSession } = require("./lib/checkout-session.js");

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

// Same path as the Vercel serverless function in api/create-checkout-session.js,
// so the frontend hits the same URL locally and in production.
app.post("/api/create-checkout-session", async (req, res) => {
  const cartItems = Array.isArray(req.body.items) ? req.body.items : [];
  const fulfillment = req.body.fulfillment || null;
  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
  const { status, body } = await createCheckoutSession(stripe, cartItems, origin, fulfillment);
  res.status(status).json(body);
});

app.listen(PORT, () => {
  console.log(`Antonio's Cucina running at http://localhost:${PORT}`);
});
