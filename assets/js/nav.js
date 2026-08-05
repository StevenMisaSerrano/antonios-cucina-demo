/* Mobile hamburger nav — toggles the header's .main-nav into a dropdown
   under ~900px. Desktop layout is untouched (the toggle is display:none
   above that breakpoint). */

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("open")) closeNav();
    else openNav();
  });

  // Clicking a link (including same-page anchors like #reviews) closes the menu.
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("open")) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  // Don't leave the menu stuck open if the viewport grows past the breakpoint.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });
});
