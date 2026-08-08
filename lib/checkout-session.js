/* Shared checkout logic used by both server.js (local Express dev server)
   and api/create-checkout-session.js (Vercel serverless function), so the
   two environments can't drift out of sync. */

const MENU = require("../assets/js/menu-data.js");

function findMenuItem(name) {
  for (const categoryKey of Object.keys(MENU)) {
    const item = MENU[categoryKey].items.find((i) => i.name === name);
    if (item) return item;
  }
  return null;
}

// Looks up the trusted price for a menu item server-side. Never trust a
// price sent by the client — this is what stops someone from tampering
// with the request and checking out a $30 pizza for $1.
function findUnitPrice(item, size) {
  if (item.prices) {
    return typeof size === "string" && item.prices[size] != null ? item.prices[size] : null;
  }
  return item.price;
}

function buildLineItems(cartItems) {
  const line_items = [];
  for (const entry of cartItems) {
    const menuItem = findMenuItem(entry.name);
    if (!menuItem) {
      return { error: `"${entry.name}" isn't a valid menu item.` };
    }

    const unitPrice = findUnitPrice(menuItem, entry.size);
    if (unitPrice == null) {
      return { error: `"${entry.name}" isn't a valid menu item.` };
    }

    // Flavor never affects price, but it's still validated against the
    // item's actual flavor list rather than trusted as free text — it
    // ends up in the Stripe line item name shown in the Dashboard.
    let flavor = null;
    if (Array.isArray(menuItem.flavors) && menuItem.flavors.length > 0) {
      if (typeof entry.flavor !== "string" || !menuItem.flavors.includes(entry.flavor)) {
        return { error: `Please choose a flavor for "${entry.name}".` };
      }
      flavor = entry.flavor;
    }

    const quantity = Math.max(1, Math.min(50, parseInt(entry.qty, 10) || 1));
    let displayName = entry.name;
    if (flavor) displayName += ` — ${flavor}`;
    if (entry.size) displayName += ` (${entry.size})`;

    line_items.push({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(unitPrice * 100),
        product_data: {
          name: displayName
        }
      }
    });
  }
  return { line_items };
}

// Order-intake only: just capture pickup vs. delivery + a delivery address.
// No radius checks, delivery fees, or driver assignment here.
function normalizeFulfillment(input) {
  const method = input && (input.method === "pickup" || input.method === "delivery") ? input.method : null;

  if (method === "pickup") {
    return { fulfillment: { method: "pickup" } };
  }

  if (method === "delivery") {
    const street = String((input && input.street) || "").trim().slice(0, 200);
    const city = String((input && input.city) || "").trim().slice(0, 100);
    const zip = String((input && input.zip) || "").trim().slice(0, 20);
    if (!street || !city || !zip) {
      return { error: "Delivery address (street, city, and ZIP) is required." };
    }
    return { fulfillment: { method: "delivery", street, city, zip } };
  }

  return { error: "Please choose Pickup or Delivery." };
}

async function createCheckoutSession(stripe, cartItems, origin, fulfillmentInput) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { status: 400, body: { error: "Your cart is empty." } };
  }

  const { line_items, error: itemsError } = buildLineItems(cartItems);
  if (itemsError) {
    return { status: 400, body: { error: itemsError } };
  }

  const { fulfillment, error: fulfillmentError } = normalizeFulfillment(fulfillmentInput);
  if (fulfillmentError) {
    return { status: 400, body: { error: fulfillmentError } };
  }

  // Surfaced on both the Checkout Session and the resulting PaymentIntent/charge
  // in the Stripe Dashboard, so an order's pickup/delivery details are visible
  // wherever someone looks at the payment.
  const metadata = { fulfillment_method: fulfillment.method };
  const successParams = new URLSearchParams({ fulfillment: fulfillment.method });
  if (fulfillment.method === "delivery") {
    metadata.delivery_street = fulfillment.street;
    metadata.delivery_city = fulfillment.city;
    metadata.delivery_zip = fulfillment.zip;
    successParams.set("street", fulfillment.street);
    successParams.set("city", fulfillment.city);
    successParams.set("zip", fulfillment.zip);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}&${successParams.toString()}`,
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
