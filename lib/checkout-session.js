/* Shared checkout logic used by both server.js (local Express dev server)
   and api/create-checkout-session.js (Vercel serverless function), so the
   two environments can't drift out of sync. */

const MENU = require("../assets/js/menu-data.js");

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

function buildLineItems(cartItems) {
  const line_items = [];
  for (const entry of cartItems) {
    const unitPrice = findUnitPrice(entry.name, entry.size);
    if (unitPrice == null) {
      return { error: `"${entry.name}" isn't a valid menu item.` };
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
  return { line_items };
}

async function createCheckoutSession(stripe, cartItems, origin) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { status: 400, body: { error: "Your cart is empty." } };
  }

  const { line_items, error } = buildLineItems(cartItems);
  if (error) {
    return { status: 400, body: { error } };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`
    });
    return { status: 200, body: { url: session.url } };
  } catch (err) {
    console.error("Stripe error:", err.message);
    return {
      status: 500,
      body: { error: "Could not start checkout. Check the server logs and your Stripe test key." }
    };
  }
}

module.exports = { createCheckoutSession };
