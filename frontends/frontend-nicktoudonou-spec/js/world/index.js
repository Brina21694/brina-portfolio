/* ==========================================================================
   DATA WORLD — l'interface autour du monde 3D.

   Le moteur 3D (Three.js) n'est chargé QUE si le visiteur choisit d'explorer.
   Tout reste accessible sans lui : "Accès rapide" (#/quick), le bouton
   Contact (toujours visible) et une liste des objets de chaque zone.
   ========================================================================== */

import { CONFIG } from "../config.js";
import { esc, safeUrl, button, ARROW, ARROW_UP, month, domaineLabel, stateBlock } from "../dom.js";
import { loadProfil, loadProjets, loadStats, loadExperiences, loadSimilaires } from "../data.js";
import { reduced } from "../motion.js";

const ORDER = ["city", "lab", "archive", "journey"];
const NAMES = {
  city: ["01", "The City", "Identité"],
  lab: ["02", "The Lab", "Compétences"],
  archive: ["03", "Data Archive", "Projets"],
  journey: ["04", "The Journey", "Parcours"],
};
const ACCENT = { city: "#FFB36B", lab: "#E8262E", archive: "#FF7A3D", journey: "#F2EEE5" };
/* Ce que le visiteur peut faire dans chaque lieu (toujours affiché) */
const GUIDE = {
  city: "Choisissez une destination : cliquez sur une étiquette, sur un bâtiment, ou utilisez la barre en bas.",
  lab: "Mes compétences. Chaque écran est un domaine : cliquez dessus pour le détail.",
  archive: "Mes projets. Chaque cube est un projet : cliquez dessus. Le Data Core au centre les liste tous.",
  journey: "Mon parcours, du plus ancien au plus récent. Molette ou flèches pour avancer, clic sur une plaque pour lire.",
};
const MAP_POS = { city: [0, 0], lab: [-34, -6], archive: [34, -6], journey: [0, -62] };

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

/* ---------- Données : on prépare ce dont chaque zone a besoin ---------- */
async function loadAll() {
  const [profil, projets, stats, xp] = await Promise.allSettled([loadProfil(), loadProjets(), loadStats(), loadExperiences("")]);
  const P = profil.value ?? null;
  const usage = new Map((stats.value?.items ?? []).map((s) => [s.skill_slug, s.nb_projets]));

  const groups = new Map();
  for (const c of P?.competences ?? []) {
    const key = c.domaine ?? "autres";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ slug: c.skill_slug, nom: c.nom, niveau: c.niveau ?? null, nb: usage.get(c.skill_slug) ?? 0, valeur: c.niveau ?? 1, affiche: c.niveau ? `${c.niveau}/5` : "—" });
  }
  const domains = [...groups.entries()]
    .map(([slug, skills]) => ({ slug, label: domaineLabel(slug), skills: skills.sort((a, b) => (b.niveau ?? 0) - (a.niveau ?? 0)) }))
    .sort((a, b) => b.skills.length - a.skills.length);

  const experiences = xp.value?.items ?? P?.experiences ?? [];
  const parcours = [
    ...experiences.map((x) => ({ type: "experience", debut: x.debut, fin: x.fin, titre: x.poste, org: x.entreprise, lieu: x.lieu, description: x.description, competences: x.competences ?? [] })),
    ...(P?.formations ?? []).map((f) => ({ type: "formation", debut: f.debut, fin: f.fin, titre: f.diplome, org: f.ecole, lieu: f.lieu, description: "", competences: [] })),
  ]
    .sort((a, b) => String(a.debut).localeCompare(String(b.debut)))
    .map((s) => ({ ...s, annee: String(s.debut ?? "").slice(0, 4) || "—", periode: `${month(s.debut)} → ${month(s.fin)}` }));

  const labels = new Map((P?.competences ?? []).map((c) => [c.skill_slug, c.nom]));
  const failed = [profil, projets].some((r) => r.status === "rejected");
  return { profil: P, projets: projets.value ?? [], domains, parcours, labels, failed, error: profil.reason ?? projets.reason };
}

/* ---------- Gabarit ---------- */
function template() {
  const nav = ORDER.map((z) => `
    <a class="dw-nav__stop" href="#/${z}" data-zone="${z}" style="--z:${ACCENT[z]}">
      <span class="mono">${NAMES[z][0]}</span><strong>${NAMES[z][1]}</strong><small>${NAMES[z][2]}</small>
    </a>`).join("");
  const markers = ORDER.map((z) => `<g class="dw-map__zone" data-zone="${z}" transform="translate(${MAP_POS[z][0]} ${MAP_POS[z][1]})"><circle r="${z === "journey" ? 5 : 7}"/><text y="-11">${NAMES[z][0]}</text></g>`).join("");
  return `
  <div class="dw" data-zone="city">
    <canvas class="dw__canvas" aria-label="Monde 3D explorable. Utilisez la navigation et la liste des objets pour un accès au clavier."></canvas>

    <div class="dw__fx" aria-hidden="true"><i class="dw__bar dw__bar--t"></i><i class="dw__bar dw__bar--b"></i><div class="dw__speed"></div></div>
    <div class="dw__card" aria-hidden="true"><span class="mono js-card-num">World 01</span><strong class="display js-card-name">The City</strong></div>

    <header class="dw__top">
      <a class="dw__brand" href="#/city" aria-label="Retour à la ville">
        <span class="dw__mark" aria-hidden="true"></span>
        <span><strong>Cédric Akle</strong><small class="mono">Data World</small></span>
      </a>
      <div class="dw__where mono" aria-live="polite">
        <span class="dw__where-num js-where-num">01</span>
        <span class="js-where-name">The City</span>
        <span class="dw__coord js-coord">X 0 · Z 36</span>
      </div>
      <div class="dw__actions">
        ${button("Ville", "#/city", { variant: "ghost small", icon: ARROW, attrs: 'data-back hidden' })}
        <span class="dw__api mono js-api" hidden><i></i>API hors ligne</span>
        ${button("Contact", "", { variant: "ghost small", attrs: 'data-contact aria-haspopup="dialog"' })}
        ${button("Accès rapide", "#/quick", { variant: "small" })}
      </div>
    </header>

    <nav class="dw-nav" aria-label="Voyager vers un monde">${nav}</nav>

    <aside class="dw-objects" aria-label="Objets de la zone">
      <button class="dw-objects__toggle mono" type="button" aria-expanded="false"><span class="js-obj-title">Dans cette zone</span><i aria-hidden="true"></i></button>
      <ul class="js-objects"></ul>
    </aside>

    <svg class="dw-map" viewBox="-70 -100 140 130" aria-hidden="true">
      <path class="dw-map__route" d="M0 0 L-34 -6 M0 0 L34 -6 M0 0 L0 -95"/>
      ${markers}
      <g class="dw-map__me js-me"><path d="M0 -9 L5 3 L0 0 L-5 3 Z"/></g>
    </svg>

    <div class="dw-tags js-tags"></div>

    <div class="dw-guide" aria-live="polite">
      <span class="mono dw-guide__where js-guide-where">01 · The City</span>
      <p class="js-guide-text">${GUIDE.city}</p>
      <span class="mono dw-guide__keys js-guide-keys">Glisser : regarder · 1-4 : voyager</span>
    </div>
    <div class="dw__tip mono" aria-hidden="true"></div>

    <section class="dw-panel" role="dialog" aria-modal="false" aria-labelledby="dw-panel-title" hidden>
      <button class="dw-panel__close" type="button" aria-label="Fermer">${"×"}</button>
      <div class="dw-panel__body js-panel"></div>
    </section>

    <div class="dw-gate" role="dialog" aria-modal="true" aria-labelledby="dw-gate-title">
      <div class="dw-gate__inner">
        <span class="mono dw-gate__kicker">Portfolio ${new Date().getFullYear()} · ${esc(CONFIG.ville)}</span>
        <h1 class="display dw-gate__title" id="dw-gate-title">Data <em class="serif">world</em></h1>
        <p class="dw-gate__lead">Un monde construit à partir de mes données. Mes projets, mes compétences et mon parcours y sont des lieux que l'on visite.</p>
        <div class="dw-gate__load" aria-live="polite"><i class="js-load-bar"></i><span class="mono js-load">Construction du monde…</span></div>
        <div class="dw-gate__choices">
          <button class="dw-choice dw-choice--explore" type="button" data-explore disabled>
            <span class="mono">Mode 01</span><strong class="display">Explore</strong>
            <span>Voyager entre la ville, le lab, les archives et le parcours.</span>
            <kbd class="mono">Entrée</kbd>
          </button>
          <a class="dw-choice" href="#/quick">
            <span class="mono">Mode 02</span><strong class="display">Accès rapide</strong>
            <span>Projets, compétences, parcours et CV, comme un site classique.</span>
            <kbd class="mono">Q</kbd>
          </a>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- Contenus du panneau ---------- */
const tags = (list, labels) => list.length ? `<ul class="tags">${list.map((s) => `<li>${esc(labels.get(s) ?? s)}</li>`).join("")}</ul>` : "";

function panelHead(kicker, title, accent) {
  return `<span class="mono dw-panel__kicker" style="--z:${accent}">${kicker}</span><h2 class="display dw-panel__title" id="dw-panel-title">${title}</h2>`;
}

function contactPanel(data) {
  const p = data.profil ?? {};
  const liens = p.liens ?? {};
  const pretty = (u) => String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const row = (label, value, href, dl) => {
    const url = safeUrl(href);
    return url ? `<a class="plate" href="${esc(url)}"${url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}${dl ? " download" : ""}><span class="mono">${label}</span><strong>${esc(value)}</strong>${ARROW_UP}</a>` : "";
  };
  return `${panelHead("World 05 · Connection hub", "Let's <em class=\"serif\">connect.</em>", "#E60012")}
    <p class="dw-panel__lead">Alternance, projet ou question sur la donnée : écrivez-moi.</p>
    <div class="plates dw-plates">
      ${p.email ? row("Email", p.email, `mailto:${p.email}`) : ""}
      ${liens.linkedin ? row("LinkedIn", pretty(liens.linkedin), liens.linkedin) : ""}
      ${liens.github ? row("GitHub", pretty(liens.github), liens.github) : ""}
      ${CONFIG.cvUrl ? row("CV", "Télécharger le PDF", CONFIG.cvUrl, true) : ""}
    </div>
    ${data.failed ? `<p class="mono dw-panel__note">Profil indisponible : l'API ne répond pas.</p>` : ""}`;
}

function identityPanel(data) {
  const p = data.profil ?? {};
  const name = [p.prenom, p.nom].filter(Boolean).join(" ") || "Cédric Akle";
  return `${panelHead("World 01 · Identité", `${esc(name)}`, ACCENT.city)}
    <p class="dw-panel__meta mono">${esc(p.titre ?? "")}</p>
    <p class="dw-panel__lead">${esc(p.bio ?? "")}</p>
    <dl class="dw-facts">
      <div><dt class="mono">Projets</dt><dd>${data.projets.length}</dd></div>
      <div><dt class="mono">Compétences</dt><dd>${(p.competences ?? []).length}</dd></div>
      <div><dt class="mono">Étapes</dt><dd>${data.parcours.length}</dd></div>
    </dl>
    <div class="dw-panel__actions">
      ${button("Voir les projets", "#/archive")}
      ${button("Me contacter", "", { variant: "ghost", attrs: "data-contact" })}
    </div>`;
}

function domainPanel(d) {
  return `${panelHead(`World 02 · Lab`, esc(d.label), ACCENT.lab)}
    <p class="dw-panel__lead">Niveau déclaré dans mon profil, et nombre de mes projets qui utilisent chaque compétence (agrégation MongoDB).</p>
    <ul class="dw-skills">${d.skills.map((s) => `
      <li>
        <span class="dw-skills__name">${esc(s.nom)}</span>
        <span class="dw-skills__lvl" aria-label="Niveau ${s.niveau ?? "non renseigné"} sur 5">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= (s.niveau ?? 0) ? "on" : ""}"></i>`).join("")}</span>
        <span class="mono">${s.nb} projet${s.nb > 1 ? "s" : ""}</span>
      </li>`).join("")}</ul>`;
}

function projetPanel(p, data, index) {
  const repo = safeUrl(p.repo);
  const demo = safeUrl(p.demo);
  const etude = Object.entries({ Problème: p.etude.probleme, Méthodologie: p.etude.methodologie, Résultats: p.etude.resultats })
    .filter(([, v]) => v && String(v).trim());
  return `${panelHead(`World 03 · Archive · P.${String(index + 1).padStart(2, "0")} · ${p.annee ?? "—"}`, esc(p.titre), ACCENT.archive)}
    <p class="dw-panel__lead">${esc(p.description)}</p>
    ${p.descriptionLongue ? `<p class="dw-panel__text">${esc(p.descriptionLongue)}</p>` : ""}
    ${etude.map(([k, v]) => `<h3 class="mono dw-panel__h">${k}</h3><p class="dw-panel__text">${esc(Array.isArray(v) ? v.join("\n") : v)}</p>`).join("")}
    <h3 class="mono dw-panel__h">Technologies</h3>
    ${tags(p.competences, data.labels)}
    <div class="dw-panel__actions">
      ${button("Ouvrir l'étude de cas", `#/projet/${encodeURIComponent(p.slug)}`)}
      ${repo ? button("Code", repo, { variant: "ghost small", icon: ARROW_UP, attrs: 'target="_blank" rel="noopener"' }) : ""}
      ${demo ? button("Démo", demo, { variant: "ghost small", icon: ARROW_UP, attrs: 'target="_blank" rel="noopener"' }) : ""}
    </div>
    <h3 class="mono dw-panel__h">Projets voisins · Neo4j</h3>
    <div class="js-similar dw-similar"><span class="skeleton" style="display:block;height:48px"></span></div>`;
}

function corePanel(data) {
  return `${panelHead("World 03 · Data Core", "Les <em class=\"serif\">archives</em>", ACCENT.archive)}
    <p class="dw-panel__lead">Chaque cube est un projet stocké dans MongoDB. Choisissez-en un.</p>
    ${data.projets.length ? `<ul class="dw-list">${data.projets.map((p, i) => `
      <li><button type="button" data-open="projet-${esc(p.slug)}"><span class="mono">P.${String(i + 1).padStart(2, "0")}</span><strong>${esc(p.titre)}</strong><span class="mono">${p.annee ?? ""}</span></button></li>`).join("")}</ul>`
    : stateBlock(data.error, { hint: "Les projets viennent de GET /api/projets : lance « just dev »." })}`;
}

function stepPanel(s, data) {
  return `${panelHead(`World 04 · ${s.type === "formation" ? "Formation" : "Expérience"} · ${esc(s.periode)}`, esc(s.titre), ACCENT.journey)}
    <p class="dw-panel__meta mono">${esc([s.org, s.lieu].filter(Boolean).join(" · "))}</p>
    ${s.description ? `<p class="dw-panel__text">${esc(s.description)}</p>` : ""}
    ${tags(s.competences, data.labels)}
    <p class="mono dw-panel__note">← → ou molette : étape précédente / suivante</p>`;
}

/* ==========================================================================
   MONTAGE
   ========================================================================== */

export function renderWorld(app, firstZone = "city") {
  document.body.classList.add("is-world");
  document.title = "Data World — Cédric Akle";
  app.innerHTML = template();
  const root = app.querySelector(".dw");
  const $ = (s) => root.querySelector(s);
  {
    // liste repliée par défaut : la 3D reste dégagée, un clic l'ouvre
    root.querySelector(".dw-objects").classList.add("is-closed");
    root.querySelector(".dw-objects__toggle").setAttribute("aria-expanded", "false");
  }
  const gate = $(".dw-gate");
  const panel = $(".dw-panel");
  const panelBody = $(".js-panel");
  const tip = $(".dw__tip");
  const card = $(".dw__card");
  let world = null;
  let data = null;
  let alive = true;
  let zone = firstZone;
  let lastFocus = null;
  let mapTick = 0;
  let wheelLock = 0;

  const entered = () => { try { return sessionStorage.getItem("dw-entered") === "1"; } catch { return false; } };
  const setEntered = () => { try { sessionStorage.setItem("dw-entered", "1"); } catch { /* navigation privée */ } };

  /* ----- Panneau ----- */
  function openPanel(html, { item = null, wide = false } = {}) {
    lastFocus = document.activeElement;
    panelBody.innerHTML = html;
    panel.hidden = false;
    panel.classList.toggle("is-wide", wide);
    requestAnimationFrame(() => panel.classList.add("is-open"));
    root.classList.add("has-panel");
    panel.querySelector(".dw-panel__close").focus({ preventScroll: true });
    panel.dataset.item = item?.id ?? "";
  }
  function closePanel({ release = true } = {}) {
    if (panel.hidden) return false;
    panel.classList.remove("is-open");
    root.classList.remove("has-panel");
    setTimeout(() => { if (!panel.classList.contains("is-open")) panel.hidden = true; }, 450);
    if (release) world?.release();
    lastFocus?.focus?.({ preventScroll: true });
    return true;
  }

  function select(item) {
    if (!item) return;
    if (item.kind === "travel") { location.hash = `#/${item.target}`; return; }
    world.focus(item);
    if (item.kind === "identity") openPanel(identityPanel(data), { item });
    else if (item.kind === "domain") openPanel(domainPanel(item.data), { item });
    else if (item.kind === "core") openPanel(corePanel(data), { item });
    else if (item.kind === "step") openPanel(stepPanel(item.data, data), { item });
    else if (item.kind === "projet") {
      const index = data.projets.findIndex((p) => p.slug === item.data.slug);
      openPanel(projetPanel(item.data, data, index), { item, wide: true });
      const box = panel.querySelector(".js-similar");
      loadSimilaires(item.data.slug).then((list) => {
        if (!alive || panel.dataset.item !== item.id) return;
        box.innerHTML = list.length ? `<ul class="dw-list">${list.map((s) => `
          <li><button type="button" data-open="projet-${esc(s.projet_slug)}"><span class="mono">${s.nb_communes ?? (s.competences_communes ?? []).length} en commun</span><strong>${esc(s.titre ?? s.projet_slug)}</strong>${ARROW}</button></li>`).join("")}</ul>`
          : `<p class="dw-panel__text">Aucun autre projet ne partage de compétence avec celui-ci.</p>`;
      }).catch((error) => { if (alive) box.innerHTML = stateBlock(error, { hint: "Projets similaires : Neo4j (route 6)." }); });
    }
  }

  /* ----- Liste accessible des objets ----- */
  function listObjects() {
    const ul = $(".js-objects");
    const items = world?.listFor(zone) ?? [];
    $(".js-obj-title").textContent = `Dans ${NAMES[zone][1]} · ${items.length}`;
    ul.innerHTML = items.length
      ? items.map((it) => `<li><button type="button" data-open="${esc(it.id)}"><strong>${esc(it.label)}</strong><span class="mono">${esc(it.sub ?? "")}</span></button></li>`).join("")
      : `<li class="mono dw-objects__empty">${data?.failed ? "Données indisponibles" : "Rien ici pour l'instant"}</li>`;
  }

  /* ----- Indicateur de position ----- */
  function setZone(z) {
    zone = z;
    root.dataset.zone = z;
    root.style.setProperty("--zone", ACCENT[z]);
    $(".js-where-num").textContent = NAMES[z][0];
    $(".js-where-name").textContent = NAMES[z][1];
    root.querySelectorAll(".dw-nav__stop").forEach((a) => a.setAttribute("aria-current", String(a.dataset.zone === z)));
    root.querySelectorAll(".dw-map__zone").forEach((g) => g.classList.toggle("is-on", g.dataset.zone === z));
    $(".js-guide-where").textContent = `${NAMES[z][0]} · ${NAMES[z][1]}`;
    $(".js-guide-text").textContent = GUIDE[z];
    $(".js-guide-keys").textContent = z === "city" ? "Glisser : regarder · 1-4 : voyager · 5 : contact" : "Échap : retour à la ville · 1-4 : voyager";
    const back = root.querySelector("[data-back]");
    if (back) back.hidden = z === "city";
    listObjects();
    buildTags();
  }

  /* ----- Transition cinématographique ----- */
  function travel(state, z) {
    if (state === "start") {
      closePanel({ release: false });
      root.classList.add("is-travel");
      $(".js-card-num").textContent = `World ${NAMES[z][0]}`;
      $(".js-card-name").textContent = NAMES[z][1];
      card.style.setProperty("--z", ACCENT[z]);
      card.classList.add("is-on");
    } else {
      root.classList.remove("is-travel");
      setTimeout(() => alive && card.classList.remove("is-on"), 500);
    }
  }

  /* ----- Étiquettes accrochées aux objets 3D : on voit ce qui est cliquable ----- */
  let tags = [];
  function buildTags() {
    const box = $(".js-tags");
    if (!world) return;
    const items = world.items.filter((it) =>
      !it.id.startsWith("map-") &&
      it.kind !== "domain" &&                      // les écrans du Lab affichent déjà leur titre

      ((it.zone === zone && it.kind !== "travel") || (zone === "city" && it.zone === "*")));
    box.innerHTML = items.map((it, i) => `
      <button type="button" class="dw-tag${it.kind === "travel" ? " dw-tag--travel" : ""}" data-open="${esc(it.id)}" tabindex="-1" style="--i:${i}">
        <i aria-hidden="true"></i>
        <span><strong>${esc(it.kind === "travel" ? `→ ${it.label}` : it.label)}</strong><small class="mono">${esc(it.sub ?? "")}</small></span>
      </button>`).join("");
    tags = items.map((it, i) => ({ it, el: box.children[i] }));
  }
  function placeTags() {
    const hide = !world || world.tw || world.attract || root.classList.contains("has-panel");
    $(".js-tags").classList.toggle("is-hidden", Boolean(hide));
    if (hide) return;
    const W = innerWidth, H = innerHeight;
    const placed = [];
    for (const { it, el } of tags) {
      const p = world.screenOf(it);
      const on = p.visible && p.x > 40 && p.x < W - 40 && p.y > 70 && p.y < H - 110;
      el.classList.toggle("is-off", !on);
      if (on) {
        // évite que deux étiquettes se chevauchent : on décale vers le bas
        const w = el.offsetWidth || 160;
        let y = p.y;
        for (let k = 0; k < 5; k += 1) {
          const hit = placed.find((r) => Math.abs(r.y - y) < 34 && p.x < r.x + r.w && p.x + w > r.x);
          if (!hit) break;
          y = hit.y + 36;
        }
        placed.push({ x: p.x, y, w });
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        el.classList.toggle("dw-tag--left", p.x > W * 0.72);   // l'étiquette passe à gauche près du bord
      }
    }
  }

  /* ----- Boucle légère de l'interface (étiquettes, mini-carte, coordonnées) ----- */
  let uiRaf = 0;
  const ui = () => {
    uiRaf = requestAnimationFrame(ui);
    if (!world) return;
    placeTags();
    if (mapTick++ % 3) return;
    const w = world.where();
    $(".js-me").setAttribute("transform", `translate(${w.x.toFixed(1)} ${w.z.toFixed(1)}) rotate(${(w.a * 180 / Math.PI).toFixed(1)})`);
    $(".js-coord").textContent = `X ${w.x.toFixed(0)} · Z ${w.z.toFixed(0)}`;
  };

  /* ----- Entrée dans le monde ----- */
  function enter() {
    if (!world) return;
    setEntered();
    gate.classList.add("is-gone");
    setTimeout(() => { gate.hidden = true; }, 900);
    world.setAttract(false);
    world.zone = "";               // force un vrai voyage (avec carton) depuis la vue d'ensemble
    world.go(zone);
    setZone(zone);
    root.classList.add("is-live");
  }

  /* ----- Clavier ----- */
  const onKey = (e) => {
    if (e.target.closest?.("input, textarea")) return;
    if (!gate.hidden && !gate.classList.contains("is-gone")) {
      if (e.key === "Enter" && world) { e.preventDefault(); enter(); }
      if (e.key.toLowerCase() === "q") location.hash = "#/quick";
      return;
    }
    if (e.key === "Escape") {
      if (closePanel()) return;
      if (zone !== "city") location.hash = "#/city";
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= 4 && !e.ctrlKey && !e.metaKey) { location.hash = `#/${ORDER[n - 1]}`; return; }
    if (n === 5) { openPanel(contactPanel(data ?? {})); return; }
    if (zone === "journey" && ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(e.key) && !e.target.closest?.(".dw-panel")) {
      e.preventDefault();
      closePanel({ release: false });
      world?.journeyStep(e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : -1);
    }
  };
  const onWheel = (e) => {
    if (zone !== "journey" || e.target.closest(".dw-panel, .dw-objects") || performance.now() < wheelLock) return;
    if (Math.abs(e.deltaY) < 8) return;
    wheelLock = performance.now() + 1100;
    closePanel({ release: false });
    world?.journeyStep(e.deltaY > 0 ? 1 : -1);
  };

  /* ----- Clics de l'interface ----- */
  const onClick = (e) => {
    const t = e.target;
    if (t.closest("[data-explore]")) { enter(); return; }
    if (t.closest("[data-contact]")) { e.preventDefault(); openPanel(contactPanel(data ?? {})); return; }
    if (t.closest(".dw-panel__close")) { closePanel(); return; }
    const open = t.closest("[data-open]");
    if (open && world) {
      if (open.closest(".dw-objects")) {
        root.querySelector(".dw-objects").classList.add("is-closed");
        root.querySelector(".dw-objects__toggle").setAttribute("aria-expanded", "false");
      }
      const it = world.items.find((x) => x.id === open.dataset.open);
      if (it) select(it);
      return;
    }
    if (t.closest(".dw-objects__toggle")) {
      const b = t.closest(".dw-objects__toggle");
      const on = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(on));
      root.querySelector(".dw-objects").classList.toggle("is-closed", !on);
    }
  };

  root.addEventListener("click", onClick);
  addEventListener("keydown", onKey);
  root.addEventListener("wheel", onWheel, { passive: true });

  /* ----- Sans WebGL : on bascule proprement ----- */
  if (!hasWebGL()) {
    gate.querySelector(".dw-gate__load").innerHTML = `<span class="mono">Votre navigateur ne gère pas la 3D (WebGL). Le mode Accès rapide contient tout le portfolio.</span>`;
    gate.querySelector("[data-explore]").remove();
    return { go() {}, dispose() { cleanup(); } };
  }

  const bar = $(".js-load-bar");
  const label = $(".js-load");
  const step = (p, text) => { bar.style.transform = `scaleX(${p})`; if (text) label.textContent = text; };
  step(0.15, "Chargement du moteur 3D…");

  const mobile = matchMedia("(pointer: coarse)").matches || innerWidth < 760;

  Promise.all([
    import("./scene.js"),
    import("./textures.js").then((m) => m.fontsReady()),
    loadAll().then((d) => { step(0.6, "Lecture de MongoDB et Neo4j…"); return d; }),
  ]).then(([mod, , d]) => {
    if (!alive) return;
    data = d;
    step(0.85, "Allumage de la ville…");
    world = new mod.DataWorld($(".dw__canvas"), {
      mobile,
      reduced,
      onSelect: select,
      onZone: setZone,
      onTravel: travel,
      onHover: (it, px) => {
        if (!it || !px) { tip.classList.remove("is-on"); return; }
        tip.innerHTML = `<strong>${esc(it.label)}</strong><span>${esc(it.sub ?? "")} · ${it.kind === "travel" ? "Voyager" : "Ouvrir"}</span>`;
        tip.style.transform = `translate(${px.x + 18}px, ${px.y + 18}px)`;
        tip.classList.add("is-on");
      },
    });
    world.setData(d);
    if (d.failed) {
      const api = $(".js-api");
      api.hidden = false;
      api.title = "Lance « just dev » puis recharge la page";
    }
    uiRaf = requestAnimationFrame(ui);
    step(1, d.failed ? "Monde prêt · données hors ligne (API)" : "Monde prêt");
    const explore = gate.querySelector("[data-explore]");
    explore.disabled = false;
    if (entered()) enter();
    else { world.setAttract(true); explore.focus({ preventScroll: true }); }
  }).catch((error) => {
    console.error(error);
    if (alive) label.textContent = "Le monde 3D n'a pas pu démarrer. Utilisez l'Accès rapide.";
  });

  function cleanup() {
    alive = false;
    cancelAnimationFrame(uiRaf);
    removeEventListener("keydown", onKey);
    world?.dispose();
    document.body.classList.remove("is-world");
  }

  return {
    go(z) {
      if (!world) { zone = z; return; }
      if (!gate.hidden && !gate.classList.contains("is-gone")) { zone = z; enter(); return; }
      if (z === zone && !world.focused) return;
      closePanel({ release: false });
      world.go(z);
    },
    dispose: cleanup,
  };
}
