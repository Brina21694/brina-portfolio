/* ==========================================================================
   MOTION — apparitions au scroll, compteurs, transition entre pages.
   Tout respecte prefers-reduced-motion.
   ========================================================================== */

export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Apparition des éléments [data-reveal] ---------- */

let io = null;

function observer() {
  if (io) return io;
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  return io;
}

/* À appeler après chaque insertion de HTML contenant des [data-reveal]. */
export function reveal(root) {
  const items = root.querySelectorAll("[data-reveal]:not(.is-in)");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  items.forEach((el) => observer().observe(el));
}

export function resetReveal() {
  io?.disconnect();
  io = null;
}

/* ---------- Compteur animé (ne démarre qu'à l'écran) ---------- */

export function countUp(el, to) {
  const target = Number(to) || 0;
  if (reduced || target === 0) { el.textContent = target; return; }
  const run = () => {
    const start = performance.now();
    const duration = 1300;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(2, -10 * t);
      el.textContent = Math.round(target * (t === 1 ? 1 : eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const watch = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { watch.disconnect(); run(); }
  });
  watch.observe(el);
}

/* ---------- Transition entre pages : trois bandes obliques (rouge, ivoire, nuit) ---------- */

export function wipe(render) {
  if (reduced) {
    document.body.classList.add("is-fading");
    return new Promise((resolve) => setTimeout(() => {
      render();
      document.body.classList.remove("is-fading");
      resolve();
    }, 180));
  }
  const el = document.querySelector(".wipe");
  return new Promise((resolve) => {
    el.classList.remove("is-in", "is-out");
    void el.offsetWidth;              // force le navigateur à repartir de la position de départ
    el.classList.add("is-in");
    setTimeout(() => {
      render();
      el.classList.remove("is-in");
      el.classList.add("is-out");
      setTimeout(() => { el.classList.remove("is-out"); resolve(); }, 720);
    }, 640);
  });
}
