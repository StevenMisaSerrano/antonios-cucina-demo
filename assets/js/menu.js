function money(n) {
  return "$" + n.toFixed(2);
}

function renderMenuItem(item) {
  const hasSizes = !!item.prices;
  const optionKeys = hasSizes ? Object.keys(item.prices) : [];
  const basePrice = hasSizes ? item.prices[optionKeys[0]] : item.price;
  const priceLabel = hasSizes
    ? optionKeys.map((k) => `${k.slice(0, 1)} ${money(item.prices[k])}`).join(" \u00b7 ")
    : money(item.price);

  const selectId = "sel-" + item.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return `
    <div class="menu-item" data-name="${item.name}" data-base="${basePrice}">
      <div class="menu-item-top">
        <h3>${item.name}</h3>
        <span class="price">${priceLabel}</span>
      </div>
      ${item.desc ? `<p class="desc">${item.desc}</p>` : ""}
      ${
        hasSizes
          ? `<select id="${selectId}" class="size-select">
              ${optionKeys
                .map(
                  (k, i) =>
                    `<option value="${k}" data-price="${item.prices[k]}">${k} \u2014 ${money(item.prices[k])}</option>`
                )
                .join("")}
            </select>`
          : ""
      }
      ${
        item.addOn
          ? `<label class="option-check"><input type="checkbox" /> ${item.addOn}</label>`
          : ""
      }
      <button class="add-btn" data-item="${item.name}" data-price="${basePrice}"${hasSizes ? ` data-size="${optionKeys[0]}"` : ""}>+ Add</button>
    </div>
  `;
}

function renderCategory(key) {
  const cat = MENU[key];
  const items = cat.items.map(renderMenuItem).join("");
  return `
    <div class="menu-items">${items}</div>
    ${cat.note ? `<div class="menu-note">${cat.note}</div>` : ""}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const tabsWrap = document.getElementById("menuTabs");
  const panelsWrap = document.getElementById("menuPanels");
  const order = ["pizza", "pasta", "marinara", "alfredo", "salads", "appetizers", "subs", "burgers", "desserts", "drinks"];

  order.forEach((key, i) => {
    const cat = MENU[key];
    const tabBtn = document.createElement("button");
    tabBtn.className = "menu-tab" + (i === 0 ? " active" : "");
    tabBtn.dataset.target = key;
    tabBtn.innerHTML = `<span class="icon">${cat.icon}</span>${cat.label}`;
    tabsWrap.appendChild(tabBtn);

    const panel = document.createElement("div");
    panel.className = "menu-panel" + (i === 0 ? " active" : "");
    panel.id = "panel-" + key;
    panel.innerHTML = renderCategory(key);
    panelsWrap.appendChild(panel);
  });

  tabsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu-tab");
    if (!btn) return;
    tabsWrap.querySelectorAll(".menu-tab").forEach((b) => b.classList.remove("active"));
    panelsWrap.querySelectorAll(".menu-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + btn.dataset.target).classList.add("active");
    window.scrollTo({ top: tabsWrap.offsetTop - 90, behavior: "smooth" });
  });

  panelsWrap.addEventListener("change", (e) => {
    if (!e.target.classList.contains("size-select")) return;
    const wrapper = e.target.closest(".menu-item");
    const btn = wrapper.querySelector(".add-btn");
    const opt = e.target.selectedOptions[0];
    btn.dataset.price = opt.dataset.price;
    btn.dataset.size = opt.value;
  });

  panelsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    Cart.add({
      name: btn.dataset.item,
      size: btn.dataset.size || null,
      price: parseFloat(btn.dataset.price)
    });
    const original = btn.textContent;
    btn.textContent = "Added \u2713";
    setTimeout(() => (btn.textContent = original), 900);
  });
});
