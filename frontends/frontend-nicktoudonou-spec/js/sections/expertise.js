/* ==========================================================================
   03 — EXPERTISE (route 5 : statistiques, agrégation MongoDB)
   Architecture monumentale : chaque compétence est une colonne dont la
   hauteur = nombre réel de projets qui l'utilisent. Aucun pourcentage inventé.
   ========================================================================== */

import { esc, domaineLabel, stateBlock } from "../dom.js";
import { loadStats } from "../data.js";
import { paintMonolith, StaticScene } from "../scenes.js";
import { reveal } from "../motion.js";

export function template() {
  return `
  <section class="expertise" id="expertise" data-section="03" data-label="Expertise" data-accent="#E8262E">
    <canvas class="expertise__scene" aria-hidden="true"></canvas>
    <div class="expertise__fade" aria-hidden="true"></div>
    <div class="container">
      <header class="sec-head">
        <span class="sec-head__label mono">03 — Expertise</span>
        <h2 class="sec-head__title display" data-reveal>Measured, <em class="serif">not claimed</em></h2>
        <p class="sec-head__intro" data-reveal style="--d:120ms">
          Chaque colonne est une compétence. Sa hauteur = le nombre de mes projets
          qui l'utilisent, calculé par une agrégation MongoDB.
        </p>
      </header>
      <div class="js-expertise"><div class="skeleton" style="height:380px"></div></div>
    </div>
  </section>`;
}

export function mount(root) {
  const section = root.querySelector("#expertise");
  const box = section.querySelector(".js-expertise");
  const scene = new StaticScene(section.querySelector(".expertise__scene"), paintMonolith, 5);
  let alive = true;

  loadStats().then(({ items, autres, source }) => {
    if (!alive) return;
    if (!items.length && !autres.length) {
      box.innerHTML = stateBlock(null, { empty: true, hint: "Ajoute des compétences à tes projets puis relance « just seed »." });
      return;
    }

    const max = Math.max(1, ...items.map((s) => s.nb_projets));
    const groups = new Map();
    for (const s of items) {
      const key = s.domaine ?? "autres";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    }
    const ordered = [...groups.entries()].sort((a, b) =>
      b[1].reduce((n, s) => n + s.nb_projets, 0) - a[1].reduce((n, s) => n + s.nb_projets, 0));

    let k = 0;
    const monument = ordered.map(([slug, skills]) => `
      <div class="monument__group">
        <div class="monument__cols">
          ${skills.map((s) => `
            <div class="col" style="--h:${18 + (s.nb_projets / max) * 82}%;--d:${(k++) * 70}ms"
                 title="${esc(s.nom)} : ${s.nb_projets} projet${s.nb_projets > 1 ? "s" : ""}${s.derniere_annee ? `, dernier en ${s.derniere_annee}` : ""}">
              <span class="col__value">${s.nb_projets}</span>
              <span class="col__name mono">${esc(s.nom)}</span>
            </div>`).join("")}
        </div>
        <div class="monument__label mono"><strong>${esc(domaineLabel(slug))}</strong><span>${skills.length}</span></div>
      </div>`).join("");

    const list = items.map((s) => `<li>${esc(s.nom)} : ${s.nb_projets} projet${s.nb_projets > 1 ? "s" : ""}</li>`).join("");
    const also = autres.length ? `
      <div class="expertise__also" data-reveal>
        <h3 class="mono">Également pratiqué</h3>
        <ul class="tags">${autres.map((c) => `<li>${esc(c.nom)}</li>`).join("")}</ul>
      </div>` : "";

    box.innerHTML = `
      <div class="monument" data-reveal role="img" aria-label="Compétences classées par nombre de projets">${monument}</div>
      <ul class="sr-only">${list}</ul>
      <p class="expertise__note mono">
        <span>Hauteur = nombre de projets · chiffre au sommet = valeur exacte</span>
        <span>src: ${esc(source)}</span>
      </p>
      ${also}`;
    reveal(box);
  }).catch((error) => {
    if (alive) box.innerHTML = stateBlock(error, { hint: "Les statistiques viennent de GET /api/stats/competences." });
  });

  return () => { alive = false; scene.destroy(); };
}
