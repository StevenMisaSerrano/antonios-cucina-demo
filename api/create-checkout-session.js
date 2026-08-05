/* Vercel serverless function — same endpoint path and behavior as the
   local Express route in server.js, backed by the shared lib/checkout-session.js
   so pricing/validation logic can't drift between dev and production. */

const Stripe = require("stripe");
const { createCheckoutSession } = require("../lib/checkout-session.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      error: "STRIPE_SECRET_KEY is not set in this Vercel project's environment variables."
    });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || `https://${req.headers.host}`;
  const cartItems = Array.isArray(req.body && req.body.items) ? req.body.items : [];

  const { status, body } = await createCheckoutSession(stripe, cartItems, origin);
  res.status(status).json(body);
};
