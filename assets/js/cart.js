/* Simple client-side cart shared across pages via localStorage */

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
  },

  add(item) {
    const items = this.get();
    items.push(item);
    this.save(items);
    this.flashFab();
  },

  count() {
    return this.get().length;
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

document.addEventListener("DOMContentLoaded", () => {
  Cart.renderCount();

  document.querySelectorAll(".cart-fab").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert(
        Cart.count() === 0
          ? "Your cart is empty. Add something delicious from the menu!"
          : Cart.count() + " item(s) in your cart. Checkout flow goes here."
      );
    });
  });
});
