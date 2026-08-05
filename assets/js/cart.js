/* Simple client-side cart shared across pages via localStorage,
   plus a drawer UI and Stripe Checkout (test mode) handoff. */

const PICKUP_ADDRESS = "220 S Main St, Alturas, CA 96101";
const PICKUP_HOURS = "Open Mon–Sun · 11AM–9PM";

function cartMoney(n) {
  return "$" + n.toFixed(2);
}

function cartLineKey(name, size) {
  return name + "|" + (size || "");
}

function escapeAttr(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

const Cart = {
  key: "antonios_cart",

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch (e) {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    this.renderCount();
    CartDrawer.render();
  },

  add(item) {
    const items = this.get();
    items.push(item);
    this.save(items);
    this.flashFab();
  },

  // Removes a single unit of the given name/size (used by the drawer's − button).
  removeOne(name, size) {
    const items = this.get();
    const idx = items.findIndex((i) => i.name === name && (i.size || "") === (size || ""));
    if (idx !== -1) items.splice(idx, 1);
    this.save(items);
  },

  clear() {
    this.save([]);
  },

  count() {
    return this.get().length;
  },

  total() {
    return this.get().reduce((sum, i) => sum + i.price, 0);
  },

  // Groups individual unit entries into {name, size, price, qty, lineTotal} lines.
  summary() {
    const byKey = new Map();
    this.get().forEach((item) => {
      const key = cartLineKey(item.name, item.size);
      if (!byKey.has(key)) {
        byKey.set(key, { name: item.name, size: item.size || null, price: item.price, qty: 0 });
      }
      byKey.get(key).qty += 1;
    });
    return [...byKey.values()].map((line) => ({ ...line, lineTotal: line.price * line.qty }));
  },

  renderCount() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = this.count();
    });
  },

  flashFab() {
    const fab = document.querySelector(".cart-fab");
    if (!fab) return;
    fab.classList.add("bump");
    setTimeout(() => fab.classList.remove("bump"), 220);
  }
};

// Pickup vs delivery choice, required before checkout. Persisted like the
// cart so it survives navigating between index.html and menu.html.
const Fulfillment = {
  key: "antonios_fulfillment",

  get() {
    try {
      return { method: null, street: "", city: "", zip: "", ...JSON.parse(localStorage.getItem(this.key)) };
    } catch (e) {
      return { method: null, street: "", city: "", zip: "" };
    }
  },

  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },

  update(patch) {
    const next = { ...this.get(), ...patch };
    this.save(next);
    return next;
  },

  clear() {
    localStorage.removeItem(this.key);
  },

  isValid() {
    const f = this.get();
    if (f.method === "pickup") return true;
    if (f.method === "delivery") {
      return !!(f.street.trim() && f.city.trim() && f.zip.trim());
    }
    return false;
  }
};

const CartDrawer = {
  built: false,

  build() {
    if (this.built) return;
    this.built = true;

    const overlay = document.createElement("div");
    overlay.className = "cart-overlay";
    overlay.setAttribute("data-cart-overlay", "");

    const drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.setAttribute("data-cart-drawer", "");
    drawer.innerHTML = `
      <div class="cart-drawer-head">
        <h3>Your Order</h3>
        <button class="cart-drawer-close" data-cart-close aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-drawer-body">
        <div data-cart-lines></div>
        <div class="cart-fulfillment" data-cart-fulfillment></div>
      </div>
      <div class="cart-drawer-foot">
        <div class="cart-total-row">
          <span>Total</span>
          <span data-cart-total>$0.00</span>
        </div>
        <p class="cart-error" data-cart-error hidden></p>
        <button class="btn btn-gold btn-block" data-cart-checkout>Checkout</button>
        <p class="cart-test-note">Test mode — no real charge will be made.</p>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    overlay.addEventListener("click", () => this.close());
    drawer.querySelector("[data-cart-close]").addEventListener("click", () => this.close());

    drawer.querySelector("[data-cart-lines]").addEventListener("click", (e) => {
      const incBtn = e.target.closest("[data-cart-inc]");
      const decBtn = e.target.closest("[data-cart-dec]");
      if (!incBtn && !decBtn) return;

      const key = (incBtn || decBtn).dataset.cartInc || (incBtn || decBtn).dataset.cartDec;
      const line = Cart.summary().find((l) => cartLineKey(l.name, l.size) === key);
      if (!line) return;

      if (incBtn) Cart.add({ name: line.name, size: line.size, price: line.price });
      else Cart.removeOne(line.name, line.size);
    });

    const fulfillmentEl = drawer.querySelector("[data-cart-fulfillment]");
    fulfillmentEl.addEventListener("change", (e) => {
      const radio = e.target.closest("[data-fulfillment-method]");
      if (!radio) return;
      Fulfillment.update({ method: radio.value });
      this.renderFulfillment();
    });
    fulfillmentEl.addEventListener("input", (e) => {
      const field = e.target.closest("[data-fulfillment-field]");
      if (!field) return;
      Fulfillment.update({ [field.dataset.fulfillmentField]: field.value });
    });

    drawer.querySelector("[data-cart-checkout]").addEventListener("click", () => this.checkout());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  },

  open() {
    this.build();
    this.render();
    this.renderFulfillment();
    document.querySelector("[data-cart-overlay]").classList.add("open");
    document.querySelector("[data-cart-drawer]").classList.add("open");
    document.body.classList.add("cart-open");
  },

  close() {
    const overlay = document.querySelector("[data-cart-overlay]");
    const drawer = document.querySelector("[data-cart-drawer]");
    if (overlay) overlay.classList.remove("open");
    if (drawer) drawer.classList.remove("open");
    document.body.classList.remove("cart-open");
  },

  render() {
    if (!this.built) return;
    const linesEl = document.querySelector("[data-cart-lines]");
    const totalEl = document.querySelector("[data-cart-total]");
    const checkoutBtn = document.querySelector("[data-cart-checkout]");
    const lines = Cart.summary();

    if (lines.length === 0) {
      linesEl.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
          <a href="menu.html" class="btn btn-outline-maroon">Browse the Menu</a>
        </div>
      `;
      checkoutBtn.disabled = true;
      document.querySelector("[data-cart-fulfillment]").innerHTML = "";
    } else {
      linesEl.innerHTML = lines
        .map((line) => {
          const key = cartLineKey(line.name, line.size);
          return `
            <div class="cart-line">
              <div class="cart-line-info">
                <div class="cart-line-name">${line.name}${line.size ? ` <span class="cart-line-size">(${line.size})</span>` : ""}</div>
                <div class="cart-line-price">${cartMoney(line.price)} each</div>
              </div>
              <div class="cart-line-qty">
                <button type="button" data-cart-dec="${key}" aria-label="Remove one ${line.name}">&minus;</button>
                <span>${line.qty}</span>
                <button type="button" data-cart-inc="${key}" aria-label="Add one more ${line.name}">+</button>
              </div>
              <div class="cart-line-total">${cartMoney(line.lineTotal)}</div>
            </div>
          `;
        })
        .join("");
      checkoutBtn.disabled = false;
      // Only (re)build the fulfillment section the first time items appear —
      // rebuilding it on every quantity change would blow away in-progress
      // typing in the delivery address fields.
      if (!document.querySelector("[data-cart-fulfillment]").innerHTML.trim()) {
        this.renderFulfillment();
      }
    }

    totalEl.textContent = cartMoney(Cart.total());
  },

  renderFulfillment() {
    const container = document.querySelector("[data-cart-fulfillment]");
    if (!container) return;
    if (Cart.summary().length === 0) {
      container.innerHTML = "";
      return;
    }

    const f = Fulfillment.get();
    container.innerHTML = `
      <h4 class="cart-section-title">Pickup or Delivery?</h4>
      <div class="fulfillment-toggle">
        <label class="fulfillment-option${f.method === "pickup" ? " selected" : ""}">
          <input type="radio" name="fulfillment-method" value="pickup" data-fulfillment-method ${f.method === "pickup" ? "checked" : ""}>
          Pickup
        </label>
        <label class="fulfillment-option${f.method === "delivery" ? " selected" : ""}">
          <input type="radio" name="fulfillment-method" value="delivery" data-fulfillment-method ${f.method === "delivery" ? "checked" : ""}>
          Delivery
        </label>
      </div>
      ${
        f.method === "pickup"
          ? `<div class="fulfillment-detail pickup-confirm">
               <p class="pickup-confirm-label">Pickup Location</p>
               <p>${PICKUP_ADDRESS}</p>
               <p>${PICKUP_HOURS}</p>
             </div>`
          : ""
      }
      ${
        f.method === "delivery"
          ? `<div class="fulfillment-detail delivery-form">
               <label>Street Address
                 <input type="text" data-fulfillment-field="street" value="${escapeAttr(f.street)}" placeholder="123 Main St">
               </label>
               <div class="delivery-form-row">
                 <label>City
                   <input type="text" data-fulfillment-field="city" value="${escapeAttr(f.city)}" placeholder="Alturas">
                 </label>
                 <label>ZIP
                   <input type="text" inputmode="numeric" data-fulfillment-field="zip" value="${escapeAttr(f.zip)}" placeholder="96101">
                 </label>
               </div>
             </div>`
          : ""
      }
    `;
  },

  async checkout() {
    const btn = document.querySelector("[data-cart-checkout]");
    const errorEl = document.querySelector("[data-cart-error]");
    const lines = Cart.summary();
    if (lines.length === 0) return;

    errorEl.hidden = true;

    const fulfillment = Fulfillment.get();
    if (!fulfillment.method) {
      errorEl.textContent = "Please choose Pickup or Delivery before checking out.";
      errorEl.hidden = false;
      return;
    }
    if (fulfillment.method === "delivery" && !Fulfillment.isValid()) {
      errorEl.textContent = "Please fill in your delivery street address, city, and ZIP before checking out.";
      errorEl.hidden = false;
      return;
    }

    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = "Redirecting to checkout…";

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ name: l.name, size: l.size, qty: l.qty })),
          fulfillment:
            fulfillment.method === "delivery"
              ? {
                  method: "delivery",
                  street: fulfillment.street.trim(),
                  city: fulfillment.city.trim(),
                  zip: fulfillment.zip.trim()
                }
              : { method: "pickup" }
        })
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      errorEl.textContent =
        "Checkout isn't available right now — make sure the site is running via " +
        "“npm start” (not the plain static server), and that a Stripe test key is set in .env.";
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Cart.renderCount();

  document.querySelectorAll(".cart-fab").forEach((btn) => {
    btn.addEventListener("click", () => CartDrawer.open());
  });
});
