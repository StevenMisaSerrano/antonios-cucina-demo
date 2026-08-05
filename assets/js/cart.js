/* Simple client-side cart shared across pages via localStorage,
   plus a drawer UI and Stripe Checkout (test mode) handoff. */

function cartMoney(n) {
  return "$" + n.toFixed(2);
}

function cartLineKey(name, size) {
  return name + "|" + (size || "");
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
      <div class="cart-drawer-body" data-cart-body></div>
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

    drawer.querySelector("[data-cart-body]").addEventListener("click", (e) => {
      const incBtn = e.target.closest("[data-cart-inc]");
      const decBtn = e.target.closest("[data-cart-dec]");
      if (!incBtn && !decBtn) return;

      const key = (incBtn || decBtn).dataset.cartInc || (incBtn || decBtn).dataset.cartDec;
      const line = Cart.summary().find((l) => cartLineKey(l.name, l.size) === key);
      if (!line) return;

      if (incBtn) Cart.add({ name: line.name, size: line.size, price: line.price });
      else Cart.removeOne(line.name, line.size);
    });

    drawer.querySelector("[data-cart-checkout]").addEventListener("click", () => this.checkout());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  },

  open() {
    this.build();
    this.render();
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
    const body = document.querySelector("[data-cart-body]");
    const totalEl = document.querySelector("[data-cart-total]");
    const checkoutBtn = document.querySelector("[data-cart-checkout]");
    const lines = Cart.summary();

    if (lines.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
          <a href="menu.html" class="btn btn-outline-maroon">Browse the Menu</a>
        </div>
      `;
      checkoutBtn.disabled = true;
    } else {
      body.innerHTML = lines
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
    }

    totalEl.textContent = cartMoney(Cart.total());
  },

  async checkout() {
    const btn = document.querySelector("[data-cart-checkout]");
    const errorEl = document.querySelector("[data-cart-error]");
    const lines = Cart.summary();
    if (lines.length === 0) return;

    errorEl.hidden = true;
    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = "Redirecting to checkout…";

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ name: l.name, size: l.size, qty: l.qty }))
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
