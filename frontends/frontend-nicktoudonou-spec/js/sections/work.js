/* ==========================================================================
   01 — SELECTED WORK (routes 2 et 3)
   Chaque projet est une scène plein écran, dans son propre "monde"
   (heure dorée, néon, monolithe, ivoire). Les scènes s'empilent au scroll :
   la suivante recouvre la précédente, qui recule et s'assombrit.
   ========================================================================== */

import { esc, pad, button, stateBlock, guardImages } from "../dom.js";
import { loadProjets, loadProfil } from "../data.js";
import { WORLDS, WORLD_ORDER, PAINTERS, StaticScene, LiveLayer } from "../scenes.js";
import { reveal, reduced } from "../motion.js";

export const worldOf = (index) => WORLD_ORDER[index % WORLD_ORDER.length];

/* Décor d'un projet : sa photo si elle existe, sinon le monde dessiné en code */
export function sceneMarkup(p, world, index) {
  return `
    <div class="case__scene" aria-hidden="true">
      <canvas data-world="${world}" data-seed="${101 + index * 17}"></canvas>
      ${world === "neon" ? '<canvas data-live="rain"></canvas>' : ""}
      ${p?.image ? `<img class="photo" data-optional src="${esc(p.image)}" alt="" loading="lazy" decoding="async">` : ""}
    </div>
    <div class="case__shade" aria-hidden="true"></div>`;
}

/* Démarre les décors présents dans `root` ; renvoie la fonction de nettoyage */
export function mountScenes(root) {
  const scenes = [...root.querySelectorAll("canvas[data-world]")].map((c) =>
    new StaticScene(c, PAINTERS[c.dataset.world], Number(c.dataset.seed)));
  const live = [...root.querySelectorAll("canvas[data-live]")].map((c) => new LiveLayer(c, c.dataset.live));
  guardImages(root);
  return () => [...scenes, ...live].forEach((s) => s.destroy());
}

/* Titre : le dernier mot prend la couleur du monde */
function titleMarkup(titre) {
  const words = String(titre).trim().split(/\s+/);
  if (words.length < 2) return `<em>${esc(titre)}</em>`;
  const last = words.pop();
  return `${esc(words.join(" "))} <em>${esc(last)}</em>`;
}

/* Petite signature de données : pour chaque compétence du projet,
   le nombre de projets du portfolio qui l'utilisent (valeurs réelles). */
function signal(p, usage, max) {
  if (!p.competences.length) return "";
  const bars = p.competences.slice(0, 12).map((s, i) =>
    `<i style="--v:${Math.round(((usage.get(s) ?? 1) / max) * 100)}%;--d:${300 + i * 60}ms"></i>`).join("");
  return `<div class="hud__row"><span class="mono">Signal</span><span class="mono">usage / compétence</span></div>
          <div class="signal" aria-hidden="true">${bars}</div>`;
}

function caseMarkup(p, index, ctx) {
  const world = worldOf(index);
  const w = WORLDS[world];
  const tags = p.competences.slice(0, 6).map((s) => `<li>${esc(ctx.labels.get(s) ?? s)}</li>`).join("");
  const metrique = Object.entries(p.metriques ?? {})[0];
  return `
  <article class="case case--${world}" data-accent="${w.accent}" style="--case-accent:${w.accent}">
    <div class="case__frame">
      ${sceneMarkup(p, world, index)}
      <div class="container case__grid">
        <div class="case__top mono">
          <span>P.${pad(index + 1)} / ${pad(ctx.total)}</span>
          <span>${esc(w.name)}</span>
          <span>${p.annee ?? "—"}</span>
        </div>
        <div></div>
        <div class="case__bottom">
          <div class="case__main">
            <span class="case__kicker mono">Étude de cas · ${p.competences.length} compétence${p.competences.length > 1 ? "s" : ""}</span>
            <h3 class="case__title display">${titleMarkup(p.titre)}</h3>
            ${p.description ? `<p class="case__desc">${esc(p.description)}</p>` : ""}
            ${tags ? `<ul class="tags">${tags}</ul>` : ""}
          </div>
          <aside class="case__hud hud">
            <div class="hud__row"><span class="mono">Année</span><span class="mono">${p.annee ?? "—"}</span></div>
            <div class="hud__row"><span class="mono">Stack</span><span class="mono">${esc(p.competences.slice(0, 3).map((s) => ctx.labels.get(s) ?? s).join(" · ") || "—")}</span></div>
            ${metrique ? `<div class="hud__row"><span class="mono">${esc(metrique[0].replace(/_/g, " "))}</span><span class="mono">${esc(metrique[1])}</span></div>` : ""}
            ${signal(p, ctx.usage, ctx.max)}
            <div style="margin-top:18px">${button("Ouvrir l'étude de cas", `#/projet/${encodeURIComponent(p.slug)}`, { variant: "small" })}</div>
          </aside>
        </div>
      </div>
    </div>
  </article>`;
}

export function template() {
  return `
  <section class="work" id="work" data-section="01" data-label="Selected Work" data-accent="#FFB36B">
    <div class="work__intro">
      <div class="container">
        <header class="sec-head" style="margin-bottom:0">
          <span class="sec-head__label mono">01 — Selected work</span>
          <h2 class="sec-head__title display" data-reveal>Selected <em class="serif">work</em><span class="work__count js-count"></span></h2>
          <p class="sec-head__intro" data-reveal style="--d:120ms">
            Chaque projet est une scène. Les fiches viennent de MongoDB ;
            les projets voisins sont calculés par Neo4j.
          </p>
          <div class="sec-head__tools chips js-filters" role="toolbar" aria-label="Filtrer par compétence"></div>
        </header>
      </div>
    </div>
    <div class="cases js-cases" aria-live="polite">
      <div class="container"><div class="skeleton" style="height:60vh"></div></div>
    </div>
  </section>`;
}

export function mount(root) {
  const box = root.querySelector(".js-cases");
  const filters = root.querySelector(".js-filters");
  let alive = true;
  let all = [];
  let ctx = { labels: new Map(), usage: new Map(), max: 1, total: 0 };
  let stopScenes = () => {};
  let io = null;

  /* La scène recouverte recule : --p va de 0 à 1 pendant que la suivante monte */
  let raf = 0;
  const depth = () => {
    raf = 0;
    const cases = box.querySelectorAll(".case");
    cases.forEach((el, i) => {
      const next = cases[i + 1];
      const p = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / innerHeight)) : 0;
      el.querySelector(".case__frame").style.setProperty("--p", p.toFixed(3));
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(depth); };
  if (!reduced) addEventListener("scroll", onScroll, { passive: true });

  const draw = (projets) => {
    if (!alive) return;
    stopScenes();
    io?.disconnect();
    box.innerHTML = projets.length
      ? projets.map((p) => caseMarkup(p, all.findIndex((x) => x.slug === p.slug), ctx)).join("")
      : `<div class="container" style="padding-bottom:120px">${stateBlock(null, { empty: true, hint: "Aucun projet pour ce filtre." })}</div>`;
    stopScenes = mountScenes(box);
    io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-in");
    }), { threshold: 0.35 });
    box.querySelectorAll(".case").forEach((el) => (reduced ? el.classList.add("is-in") : io.observe(el)));
    depth();
  };

  const setFilter = async (slug, chip) => {
    filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b === chip)));
    try {
      draw(await loadProjets(slug));
    } catch {
      draw(slug ? all.filter((p) => p.competences.includes(slug)) : all);
    }
  };

  Promise.all([loadProjets(), loadProfil().catch(() => ({ competences: [] }))])
    .then(([projets, profil]) => {
      if (!alive) return;
      all = projets;
      const usage = new Map();
      projets.forEach((p) => p.competences.forEach((s) => usage.set(s, (usage.get(s) ?? 0) + 1)));
      ctx = {
        labels: new Map((profil.competences ?? []).map((c) => [c.skill_slug, c.nom])),
        usage,
        max: Math.max(1, ...usage.values()),
        total: projets.length,
      };
      root.querySelector(".js-count").textContent = pad(projets.length);

      const top = [...usage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7).map(([s]) => s);
      if (projets.length > 1 && top.length) {
        filters.innerHTML = [`<button class="chip" type="button" data-skill="" aria-pressed="true">Tout</button>`,
          ...top.map((s) => `<button class="chip" type="button" data-skill="${esc(s)}" aria-pressed="false">${esc(ctx.labels.get(s) ?? s)}</button>`)].join("");
        filters.addEventListener("click", (e) => {
          const chip = e.target.closest(".chip");
          if (chip) setFilter(chip.dataset.skill, chip);
        });
        reveal(filters);
      }
      draw(projets);
    })
    .catch((error) => {
      if (alive) box.innerHTML = `<div class="container" style="padding-bottom:120px">${stateBlock(error, { hint: "Les projets viennent de GET /api/projets." })}</div>`;
    });

  return () => {
    alive = false; stopScenes(); io?.disconnect();
    cancelAnimationFrame(raf); removeEventListener("scroll", onScroll);
  };
}
