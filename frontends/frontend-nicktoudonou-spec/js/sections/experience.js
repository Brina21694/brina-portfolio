/* ==========================================================================
   04 — EXPERIENCE (route 4 : expériences filtrées par lieu)
   Journal de bord façon interface néon : nœuds lumineux, panneaux HUD.
   ========================================================================== */

import { esc, month, stateBlock } from "../dom.js";
import { loadExperiences, loadProfil } from "../data.js";
import { reveal } from "../motion.js";

export function template() {
  return `
  <section class="experience" id="experience" data-section="04" data-label="Experience" data-accent="#2BE4FF">
    <div class="container">
      <header class="sec-head">
        <span class="sec-head__label mono">04 — Experience</span>
        <h2 class="sec-head__title display" data-reveal>Field <em class="serif">notes</em></h2>
        <p class="sec-head__intro" data-reveal style="--d:120ms">
          Parcours professionnel. Les informations internes aux entreprises restent
          confidentielles : seuls le contexte et les compétences mobilisées sont décrits.
        </p>
        <div class="sec-head__tools chips js-lieux" role="toolbar" aria-label="Filtrer par ville"></div>
      </header>
      <ol class="log js-timeline" aria-live="polite">
        <li class="log__item"><div class="skeleton" style="height:140px"></div></li>
      </ol>
    </div>
  </section>`;
}

function row(x, labels, i) {
  const tags = (x.competences ?? []).map((s) => `<li>${esc(labels.get(s) ?? s)}</li>`).join("");
  const now = !x.fin ? `<span class="log__badge"><i aria-hidden="true"></i>En cours</span>` : "";
  return `
  <li class="log__item${x.fin ? "" : " is-now"}" data-reveal style="--d:${i * 80}ms">
    <span class="log__node" aria-hidden="true"></span>
    <div class="hud">
      <div class="log__meta mono">
        <span>${month(x.debut)} → ${month(x.fin)}</span>
        ${x.lieu ? `<span>◇ ${esc(x.lieu)}</span>` : ""}
        ${now}
      </div>
      <div class="log__role">
        <h3 class="display">${esc(x.poste)}</h3>
        <p>${esc(x.entreprise)}</p>
      </div>
      <div class="log__text">
        ${x.description ? `<p>${esc(x.description)}</p>` : ""}
        ${tags ? `<ul class="tags">${tags}</ul>` : ""}
      </div>
    </div>
  </li>`;
}

export function mount(root) {
  const list = root.querySelector(".js-timeline");
  const chips = root.querySelector(".js-lieux");
  let alive = true;
  let labels = new Map();

  const show = async (lieu) => {
    const { items } = await loadExperiences(lieu);
    if (!alive) return;
    const sorted = [...items].sort((a, b) => String(b.debut).localeCompare(String(a.debut)));
    list.innerHTML = sorted.length
      ? sorted.map((x, i) => row(x, labels, i)).join("")
      : `<li class="log__item">${stateBlock(null, { empty: true, hint: lieu ? `Aucune expérience à ${lieu}.` : "Aucune expérience renseignée." })}</li>`;
    reveal(list);
  };

  loadProfil().then((p) => {
    if (!alive) return;
    labels = new Map((p.competences ?? []).map((c) => [c.skill_slug, c.nom]));
    const lieux = [...new Set((p.experiences ?? []).map((x) => x.lieu).filter(Boolean))];
    if (lieux.length > 1) {
      chips.innerHTML = [`<button class="chip" type="button" data-lieu="" aria-pressed="true">Toutes les villes</button>`,
        ...lieux.map((l) => `<button class="chip" type="button" data-lieu="${esc(l)}" aria-pressed="false">${esc(l)}</button>`)].join("");
      chips.addEventListener("click", (e) => {
        const b = e.target.closest(".chip");
        if (!b) return;
        chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
        show(b.dataset.lieu);
      });
    }
    return show("");
  }).catch((error) => {
    if (alive) list.innerHTML = `<li class="log__item">${stateBlock(error, { hint: "Les expériences viennent de GET /api/profil et /api/experiences." })}</li>`;
  });

  return () => { alive = false; };
}
