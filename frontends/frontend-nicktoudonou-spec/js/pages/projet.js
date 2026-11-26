/* ==========================================================================
   PAGE PROJET — étude de cas (route 3) + projets similaires (route 6).
   Le projet garde le "monde" de sa scène sur l'accueil.
   Les similaires se chargent à part : si Neo4j tombe, le projet s'affiche quand même.
   ========================================================================== */

import { esc, pad, safeUrl, ARROW, ARROW_UP, button, stateBlock } from "../dom.js";
import { loadProjet, loadProjets, loadSimilaires, loadProfil } from "../data.js";
import { reveal } from "../motion.js";
import { worldOf, sceneMarkup, mountScenes } from "../sections/work.js";
import { WORLDS } from "../scenes.js";

const ETUDE = [
  ["contexte", "Contexte"],
  ["probleme", "Problème"],
  ["objectifs", "Objectifs"],
  ["donnees", "Données"],
  ["methodologie", "Méthodologie"],
  ["resultats", "Résultats"],
  ["enseignements", "Enseignements"],
];

function texte(value) {
  if (Array.isArray(value)) return value.join("\n");
  return value ?? "";
}

export function renderProjet(app, slug) {
  let alive = true;
  let stops = [];
  app.innerHTML = `
    <article class="projet" data-section="P" data-label="Étude de cas">
      <div class="js-projet"><div class="skeleton" style="height:100svh"></div></div>
    </article>`;

  const box = app.querySelector(".js-projet");

  Promise.all([
    loadProjet(slug),
    loadProjets().catch(() => []),
    loadProfil().catch(() => ({ competences: [] })),
  ]).then(([p, tous, profil]) => {
    if (!alive) return;
    document.title = `${p.titre} — Cédric Akle`;
    const labels = new Map((profil.competences ?? []).map((c) => [c.skill_slug, c.nom]));
    const index = Math.max(0, tous.findIndex((x) => x.slug === p.slug));
    const world = worldOf(index);
    const w = WORLDS[world];
    const accent = w.accent;
    const suivant = tous.length > 1 ? tous[(index + 1) % tous.length] : null;
    const nextWorld = worldOf((index + 1) % Math.max(1, tous.length));

    const repo = safeUrl(p.repo);
    const demo = safeUrl(p.demo);
    const metriques = Object.entries(p.metriques ?? {});

    const blocs = ETUDE.filter(([key]) => texte(p.etude[key]).trim())
      .map(([key, label], i) => `
        <section class="study__block" data-reveal>
          <span class="mono">${pad(i + 1)} — ${label}</span>
          <h2 class="display">${label}</h2>
          <p>${esc(texte(p.etude[key]))}</p>
        </section>`).join("");

    const corps = blocs || `
      <section class="study__block" data-reveal>
        <span class="mono">01 — Le projet</span>
        <h2 class="display">Le projet</h2>
        <p>${esc(p.descriptionLongue || p.description || "Description à venir.")}</p>
      </section>`;

    const actions = [
      repo ? button("Voir le code", repo, { attrs: 'target="_blank" rel="noopener"' }) : "",
      demo ? button("Voir la démo", demo, { variant: "ghost", icon: ARROW_UP, attrs: 'target="_blank" rel="noopener"' }) : "",
    ].join("");

    box.innerHTML = `
      <header class="p-hero case--${world} grain" data-accent="${accent}" style="--case-accent:${w.accent}">
        ${sceneMarkup(p, world, index)}
        <div class="container p-hero__grid">
          <div class="case__top mono">
            <a class="p-back" href="#/work">${ARROW}Selected work</a>
            <a class="p-back" href="#/archive">Retour au Data World</a>
            <span>${p.annee ?? "—"}</span>
          </div>
          <div></div>
          <div>
            <span class="case__kicker mono">Étude de cas</span>
            <h1 class="p-hero__title display split is-in">
              <span class="line"><span style="--i:0">${esc(p.titre)}</span></span>
            </h1>
            ${p.description ? `<p class="p-hero__lead">${esc(p.description)}</p>` : ""}
            ${actions ? `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:28px">${actions}</div>` : ""}
          </div>
        </div>
      </header>

      <section class="p-body on-ivory" data-accent="#D9541E">
        <div class="container grid p-body__grid">
          <dl class="facts hud">
            <div class="hud__row"><dt class="mono">Année</dt><dd class="mono">${p.annee ?? "—"}</dd></div>
            <div class="hud__row"><dt class="mono">Monde</dt><dd class="mono">${esc(w.name)}</dd></div>
            ${repo ? `<div class="hud__row"><dt class="mono">Code</dt><dd class="mono"><a href="${esc(repo)}" target="_blank" rel="noopener">${esc(repo.replace(/^https?:\/\/(www\.)?/, "").slice(0, 32))}</a></dd></div>` : ""}
            ${metriques.map(([k, v]) => `<div class="hud__row"><dt class="mono">${esc(k.replace(/_/g, " "))}</dt><dd class="metric">${esc(v)}</dd></div>`).join("")}
            <div style="padding-top:14px"><dt class="mono" style="margin-bottom:10px;color:var(--mist)">Compétences</dt>
              <dd style="text-align:left"><ul class="tags">${p.competences.map((s) => `<li>${esc(labels.get(s) ?? s)}</li>`).join("")}</ul></dd></div>
          </dl>
          <div class="study">${corps}</div>
        </div>
      </section>

      <section class="p-related" data-accent="#D7FF46">
        <div class="container">
          <header class="sec-head">
            <span class="sec-head__label mono">Neo4j — projets voisins</span>
            <h2 class="sec-head__title display" data-reveal>Related <em class="serif">work</em></h2>
            <p class="sec-head__intro" data-reveal>Les projets qui partagent le plus de compétences avec celui-ci, trouvés en parcourant le graphe.</p>
          </header>
          <div class="related js-similar"><div class="skeleton" style="height:220px"></div></div>
        </div>
      </section>

      ${suivant && suivant.slug !== p.slug ? `
      <a class="next case--${nextWorld}" href="#/projet/${encodeURIComponent(suivant.slug)}" data-accent="${WORLDS[nextWorld].accent}" style="--case-accent:${WORLDS[nextWorld].accent}">
        ${sceneMarkup(suivant, nextWorld, (index + 1) % tous.length)}
        <div class="container next__inner">
          <span class="mono">Projet suivant · ${esc(WORLDS[nextWorld].name)}</span>
          <strong class="next__title display"><span>${esc(suivant.titre)}</span>${ARROW}</strong>
        </div>
      </a>` : ""}`;

    stops.push(mountScenes(box));
    dispatchEvent(new Event("scroll")); // en-tête et barre prennent la couleur du monde du projet
    reveal(box);

    const sim = box.querySelector(".js-similar");
    loadSimilaires(p.slug).then((items) => {
      if (!alive) return;
      sim.innerHTML = items.length
        ? items.map((s) => {
          const k = tous.findIndex((x) => x.slug === s.projet_slug);
          const acc = WORLDS[worldOf(Math.max(0, k))].accent;
          return `
          <a class="mini" href="#/projet/${encodeURIComponent(s.projet_slug)}" style="--mini-accent:${acc === "#141418" ? "#F2EEE5" : acc}">
            <span class="mini__score mono"><strong>${s.nb_communes ?? (s.competences_communes ?? []).length}</strong>compétence(s) en commun</span>
            <div>
              <h3 class="display">${esc(s.titre ?? s.projet_slug)}</h3>
              <ul class="tags" style="margin-top:12px">${(s.competences_communes ?? []).map((c) => `<li>${esc(labels.get(c) ?? c)}</li>`).join("")}</ul>
            </div>
          </a>`;
        }).join("")
        : stateBlock(null, { empty: true, hint: "Aucun autre projet ne partage de compétence avec celui-ci." });
    }).catch((error) => {
      if (alive) sim.innerHTML = stateBlock(error, { hint: "Les projets similaires viennent de Neo4j (route 6)." });
    });
  }).catch((error) => {
    if (!alive) return;
    document.title = "Projet introuvable — Cédric Akle";
    box.innerHTML = `<div class="container" style="padding:calc(var(--header-h) + 80px) var(--pad) 120px">
      <h1 class="display h2">Projet introuvable</h1><div style="height:24px"></div>
      ${stateBlock(error, { hint: "Vérifie le slug du projet, ou relance « just seed »." })}
      <div style="height:32px"></div>${button("Retour aux projets", "#/work", { variant: "ghost" })}</div>`;
  });

  return () => { alive = false; stops.forEach((fn) => fn()); };
}
