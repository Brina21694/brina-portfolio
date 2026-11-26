/* ==========================================================================
   CHROME — tout ce qui reste à l'écran : en-tête, menu mobile,
   barre de progression, rail des sections, couleur d'accent par section.
   Un seul écouteur de scroll (regroupé avec requestAnimationFrame).
   ========================================================================== */

import { CONFIG } from "./config.js";

export function initChrome() {
  const header = document.querySelector(".site-header");
  const bar = document.querySelector(".progress span");
  const rail = document.querySelector(".rail");
  const navLinks = [...document.querySelectorAll(".nav a, .rail a")];
  const root = document.documentElement;

  /* Disponibilité */
  const status = document.querySelector(".js-status");
  if (CONFIG.disponibilite) status.querySelector("span").textContent = CONFIG.disponibilite;
  else status.remove();

  /* ---------- Menu mobile ---------- */
  const menu = document.getElementById("menu");
  const btn = document.querySelector(".menu-btn");
  const label = btn.querySelector(".menu-btn__label");

  const setMenu = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Fermer" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
      header.classList.remove("is-light");
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 650);
      update();
    }
  };
  btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  /* ---------- Scroll : progression, couleur de l'en-tête, section active ---------- */
  let ticking = false;
  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;

    if (btn.getAttribute("aria-expanded") !== "true") {
      header.classList.toggle("is-scrolled", scrollY > 8);
      const under = document.elementFromPoint(innerWidth / 2, header.offsetHeight + 2);
      header.classList.toggle("is-light", Boolean(under?.closest(".on-ivory, .case--ivory")));
    }

    const mid = document.elementFromPoint(innerWidth / 2, innerHeight * 0.45)?.closest("[data-section]");
    if (mid) {
      // Chaque section (ou chaque projet) impose sa couleur : barre, nav, puces…
      const lit = document.elementFromPoint(innerWidth / 2, innerHeight * 0.45)?.closest("[data-accent]");
      const accent = lit?.dataset.accent ?? mid.dataset.accent;
      if (accent && root.style.getPropertyValue("--accent") !== accent) root.style.setProperty("--accent", accent);
      const id = mid.id || "";
      const href = id === "intro" ? "#/quick" : `#/${id}`;
      navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === href)));
      rail.classList.toggle("is-hidden", !mid.id || mid.id === "intro");
    }
  }
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  /* Les pages appellent ceci après leur affichage */
  return { refresh: onScroll };
}
