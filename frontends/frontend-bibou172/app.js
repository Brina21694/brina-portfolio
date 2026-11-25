const CANDIDAT_SLUG = "bibou172";

const DEMO_PROFIL = {
  candidat_slug: "bibou172",
  prenom: "Beleive",
  nom: "Tossou",
  titre: "Data Analyst / Data Engineer — Alternante Renault Sandouville",
  bio: "Étudiante en cycle ingénieur à l'ESIGELEC et alternante Data Analyst chez Renault Sandouville (département Peinture). Je conçois des dashboards Looker sur les flux et arrêts de chaînes ainsi que des architectures data modernes.",
  email: "beleive.tossou@groupe-esigelec.org",
  liens: {
    github: "https://github.com/Bibou172",
    linkedin: "https://www.linkedin.com/in/beleive-tossou"
  },
  experiences: [
    {
      entreprise: "Renault Sandouville",
      poste: "Data Analyst (Alternance 24 mois — Département Peinture)",
      lieu: "Sandouville",
      debut: "2025-09",
      fin: null,
      description: "Conception et maintenance de dashboards Looker pour le suivi des flux de production et l'analyse des arrêts de chaînes en atelier Peinture.",
      competences: ["looker", "sql", "bigquery", "python"]
    },
    {
      entreprise: "Direction Nationale des Marchés Publics",
      poste: "Stage académique en gestion de base de données",
      lieu: "Cotonou, Bénin",
      debut: "2024-06",
      fin: "2024-08",
      description: "Modélisation d'une base de données avec MERISE et élaboration de la documentation (MCD, MLD, MPD) sous SAP PowerDesigner.",
      competences: ["sql", "merise", "oracle"]
    }
  ],
  formations: [
    {
      ecole: "ESIGELEC Rouen",
      diplome: "Cycle Ingénieur — Big Data & Transformation Numérique",
      lieu: "Saint-Étienne-du-Rouvray",
      debut: "2024-09",
      fin: "2027-06"
    },
    {
      ecole: "ESIGELEC Rouen",
      diplome: "Cycle Préparatoire Intégré aux études d'ingénieur",
      lieu: "Saint-Étienne-du-Rouvray",
      debut: "2021-09",
      fin: "2023-06"
    }
  ],
  competences: [
    { skill_slug: "looker", nom: "Looker", domaine: "bi-visualisation", niveau: 4 },
    { skill_slug: "power-bi", nom: "Power BI", domaine: "bi-visualisation", niveau: 4 },
    { skill_slug: "python", nom: "Python", domaine: "langages", niveau: 4 },
    { skill_slug: "sql", nom: "SQL", domaine: "langages", niveau: 4 },
    { skill_slug: "java", nom: "Java", domaine: "langages", niveau: 3 },
    { skill_slug: "bigquery", nom: "BigQuery", domaine: "data-bigdata", niveau: 4 },
    { skill_slug: "talend", nom: "Talend", domaine: "data-bigdata", niveau: 3 },
    { skill_slug: "hadoop", nom: "Hadoop", domaine: "data-bigdata", niveau: 3 },
    { skill_slug: "mongodb", nom: "MongoDB", domaine: "bases-de-donnees", niveau: 4 },
    { skill_slug: "neo4j", nom: "Neo4j", domaine: "bases-de-donnees", niveau: 4 },
    { skill_slug: "oracle", nom: "Oracle DB / PL-SQL", domaine: "bases-de-donnees", niveau: 3 },
    { skill_slug: "docker", nom: "Docker", domaine: "devops", niveau: 4 },
    { skill_slug: "fastapi", nom: "FastAPI", domaine: "backend", niveau: 4 }
  ]
};

const DEMO_PROJETS = [
  {
    projet_slug: "portfolio-polyglotte",
    titre: "Portfolio Polyglotte",
    contexte: "TP fil rouge NoSQL — ESIGELEC",
    description: "API REST asynchrone FastAPI orchestrant MongoDB et Neo4j avec conteneurisation Docker.",
    description_longue: "Architecture polyglotte associant MongoDB pour les documents du profil candidat/projets et Neo4j pour l'exploration des compétences, domaines et recommandations de projets similaires.",
    annee: 2026,
    competences: ["python", "fastapi", "mongodb", "neo4j", "docker"],
    lien_repo: "https://github.com/nosql-esigelec/2026-2027-rouen-portfolio-blackhat"
  },
  {
    projet_slug: "smartcity",
    titre: "SmartCity",
    contexte: "Projet Data & Conteneurisation",
    description: "Plateforme de collecte, structuration et analyse de données urbaines déployée avec Docker.",
    description_longue: "Architecture conteneurisée sous Docker pour le traitement, le stockage et l'exploitation analytique de données urbaines SmartCity.",
    annee: 2026,
    competences: ["python", "docker", "mongodb", "sql"],
    lien_repo: "https://github.com/Bibou172/smartcity"
  },
  {
    projet_slug: "analyse-performance-agents-immobiliers",
    titre: "Analyse de la Performance d'Agents Immobiliers",
    contexte: "Projet Académique Data — ESIGELEC",
    description: "Développement de KPIs et identification des Top Performers avec Python sur un dataset de ventes immobilières.",
    description_longue: "Évaluation comparative basée sur un dataset de prix de ventes de maisons : chiffre d'affaires, prix moyen par vente et taux de succès.",
    annee: 2025,
    competences: ["python", "sql"],
    lien_repo: null
  },
  {
    projet_slug: "modernisation-e-service",
    titre: "Modernisation d'un e-service",
    contexte: "Projet Développement Logiciel — ESIGELEC",
    description: "Conception d'une base de données Oracle SQL, développement Java (Windows Builder) et cycle en V.",
    description_longue: "Modélisation UML, implémentation d'une base de données Oracle DB + SQL et réalisation d'interfaces graphiques en Java.",
    annee: 2025,
    competences: ["java", "oracle", "sql"],
    lien_repo: null
  }
];

const el = (id) => document.getElementById(id);

const DOMAIN_LABELS = {
  "bi-visualisation": "BI & Visualisation",
  "data-bigdata": "Big Data & ETL",
  "bases-de-donnees": "Bases de données & NoSQL",
  "langages": "Langages de programmation",
  "backend": "Backend & API",
  "devops": "Conteneurisation & DevOps"
};

function navigateTo(pageName) {
  document.querySelectorAll(".page-section").forEach((sec) => {
    sec.classList.remove("active");
  });
  const target = el(`page-${pageName}`);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-pill").forEach((btn) => {
    const isCurrent = btn.dataset.nav === pageName;
    btn.className = isCurrent
      ? "nav-pill px-3.5 py-1.5 rounded-full bg-espresso text-cream transition"
      : "nav-pill px-3.5 py-1.5 rounded-full text-taupe hover:bg-linen hover:text-espresso transition";
  });

  if (pageName === "graphe") {
    loadGraph();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==================== MINI-JEU 2D CLEAN GIRL ==================== */
const STATIONS = [
  { id: "parcours", label: "Parcours", sub: "Matcha & CV", x: 110, color: "#7A8B74", roof: "#DCE5D8" },
  { id: "projets", label: "Projets", sub: "Atelier", x: 280, color: "#C8A992", roof: "#F2E4D9" },
  { id: "competences", label: "Compétences", sub: "Librairie", x: 460, color: "#9A8478", roof: "#EAE0D7" },
  { id: "graphe", label: "Graphe", sub: "Jardin", x: 640, color: "#6E8268", roof: "#D7E3D2" },
  { id: "contact", label: "Contact", sub: "Boutique", x: 805, color: "#B88E72", roof: "#F5E8DC" }
];

const gameState = {
  playerX: 460,
  targetX: null,
  autoEnterTarget: null,
  facing: 1,
  walkPhase: 0,
  keys: { left: false, right: false },
  hidden: false
};

function toggleGameScene() {
  gameState.hidden = !gameState.hidden;
  const wrapper = el("game-wrapper");
  const label = el("game-toggle-label");
  if (wrapper) wrapper.classList.toggle("hidden", gameState.hidden);
  if (label) label.textContent = gameState.hidden ? "Afficher le jeu" : "Masquer le jeu";
}

function getNearestStation() {
  let best = STATIONS[0];
  let bestDist = Infinity;
  STATIONS.forEach((st) => {
    const d = Math.abs(gameState.playerX - st.x);
    if (d < bestDist) {
      bestDist = d;
      best = st;
    }
  });
  return { station: best, dist: bestDist };
}

function focusStation(stationId) {
  const st = STATIONS.find((s) => s.id === stationId);
  if (!st) return;
  gameState.targetX = st.x;
  gameState.autoEnterTarget = stationId;
}

function drawCleanGirlScene() {
  const canvas = el("clean-girl-canvas");
  if (!canvas || gameState.hidden) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const groundY = 212;

  // Ciel crème & lumière douce
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, "#FDFBF7");
  sky.addColorStop(1, "#F3EDE4");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, groundY);

  // Petits nuages & feuillage léger en arrière-plan
  ctx.fillStyle = "#E8DFD1";
  ctx.beginPath();
  ctx.arc(160, 56, 22, 0, Math.PI * 2);
  ctx.arc(182, 52, 27, 0, Math.PI * 2);
  ctx.arc(206, 58, 19, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(730, 50, 20, 0, Math.PI * 2);
  ctx.arc(754, 46, 26, 0, Math.PI * 2);
  ctx.arc(776, 54, 18, 0, Math.PI * 2);
  ctx.fill();

  // Allée / trottoir beige
  ctx.fillStyle = "#E6DDD0";
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.fillStyle = "#D6C9B8";
  ctx.fillRect(0, groundY, w, 4);

  const { station: nearest, dist } = getNearestStation();
  const isNear = dist < 52;
  const hintEl = el("game-station-hint");
  if (hintEl) {
    hintEl.textContent = isNear
      ? `À côté de « ${nearest.label} » — clique sur « Entrer dans le lieu » ou appuie sur Entrée`
      : `Station la plus proche : ${nearest.label} (${nearest.sub})`;
  }

  // Dessiner les 5 stands Clean Girl
  STATIONS.forEach((st) => {
    const active = nearest.id === st.id && isNear;
    const boxW = 116;
    const boxH = 74;
    const bx = st.x - boxW / 2;
    const by = groundY - boxH;

    // Ombre douce
    ctx.fillStyle = "rgba(44, 37, 32, 0.06)";
    ctx.beginPath();
    ctx.ellipse(st.x, groundY + 6, 56, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Façade boutique / stand
    ctx.fillStyle = "#FDFBF8";
    ctx.strokeStyle = active ? "#7A8B74" : "#D8CEC0";
    ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 14);
    ctx.fill();
    ctx.stroke();

    // Auvent rayé / pastel
    ctx.fillStyle = st.roof;
    ctx.beginPath();
    ctx.roundRect(bx - 4, by - 12, boxW + 8, 22, 10);
    ctx.fill();

    // Porte vitrée / fenêtre
    ctx.fillStyle = st.color;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.roundRect(bx + 14, by + 26, 36, 48, 8);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Petit plant / détail déco
    ctx.fillStyle = "#7A8B74";
    ctx.beginPath();
    ctx.arc(bx + boxW - 22, by + 56, 9, 0, Math.PI * 2);
    ctx.fill();

    // Étiquette au-dessus du stand
    ctx.fillStyle = active ? "#2C2520" : "#786B61";
    ctx.font = active ? "600 12px 'Plus Jakarta Sans', sans-serif" : "500 11px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(st.label, st.x, by - 20);
  });

  // Avatar Clean Girl (chignon bun, ensemble crème & sauge, tote bag)
  const px = gameState.playerX;
  const bob = Math.sin(gameState.walkPhase) * 2.5;
  const legSwing = Math.sin(gameState.walkPhase) * 6;

  ctx.save();
  ctx.translate(px, groundY + bob);

  // Ombre avatar
  ctx.fillStyle = "rgba(44, 37, 32, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 4 - bob, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jambes
  ctx.strokeStyle = "#2C2520";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, -18);
  ctx.lineTo(-4 + legSwing, -2);
  ctx.moveTo(4, -18);
  ctx.lineTo(4 - legSwing, -2);
  ctx.stroke();

  // Robe / ensemble lin & sauge
  ctx.fillStyle = "#7A8B74";
  ctx.beginPath();
  ctx.roundRect(-10, -38, 20, 22, 8);
  ctx.fill();

  // Tote bag beige
  ctx.fillStyle = "#E6DDD0";
  ctx.strokeStyle = "#786B61";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(gameState.facing >= 0 ? 7 : -15, -24, 9, 11, 3);
  ctx.fill();
  ctx.stroke();

  // Tête
  ctx.fillStyle = "#DFB89E";
  ctx.beginPath();
  ctx.arc(0, -47, 9, 0, Math.PI * 2);
  ctx.fill();

  // Chignon Clean Girl
  ctx.fillStyle = "#3A2E28";
  ctx.beginPath();
  ctx.arc(-gameState.facing * 3, -57, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Cheveux autour de la tête
  ctx.beginPath();
  ctx.arc(0, -48, 9.2, Math.PI * 0.85, Math.PI * 2.15);
  ctx.fill();

  ctx.restore();
}

function updateGameLoop() {
  if (!gameState.hidden) {
    let moving = false;
    const speed = 4.2;

    if (gameState.keys.left) {
      gameState.playerX -= speed;
      gameState.facing = -1;
      gameState.targetX = null;
      gameState.autoEnterTarget = null;
      moving = true;
    } else if (gameState.keys.right) {
      gameState.playerX += speed;
      gameState.facing = 1;
      gameState.targetX = null;
      gameState.autoEnterTarget = null;
      moving = true;
    } else if (gameState.targetX !== null) {
      const diff = gameState.targetX - gameState.playerX;
      if (Math.abs(diff) > speed) {
        gameState.playerX += Math.sign(diff) * speed;
        gameState.facing = Math.sign(diff);
        moving = true;
      } else {
        gameState.playerX = gameState.targetX;
        gameState.targetX = null;
        if (gameState.autoEnterTarget) {
          const dest = gameState.autoEnterTarget;
          gameState.autoEnterTarget = null;
          navigateTo(dest);
        }
      }
    }

    gameState.playerX = Math.max(48, Math.min(872, gameState.playerX));
    if (moving) {
      gameState.walkPhase += 0.24;
    } else {
      gameState.walkPhase = 0;
    }

    drawCleanGirlScene();
  }
  requestAnimationFrame(updateGameLoop);
}

/* ==================== API & RENDU ==================== */
function getApiUrl() {
  return (el("api-url").value.trim() || "http://localhost:8000").replace(/\/+$/, "");
}

async function apiGet(path, params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v != null)
  );
  const qs = new URLSearchParams(clean).toString();
  const res = await fetch(`${getApiUrl()}${path}${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function renderBadges(items = []) {
  return items
    .map(
      (item) =>
        `<span class="inline-block text-xs font-medium px-3 py-1 rounded-full bg-linen text-espresso border border-sand">${item}</span>`
    )
    .join(" ");
}

function renderTopSkills(items = []) {
  el("top-skills-bar").innerHTML = items
    .map(
      (s) =>
        `<span class="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-full bg-oat border border-sand text-espresso shadow-card">
          <span>${s.nom || s.skill_slug}</span>
          <span class="text-sage font-semibold">• ${s.nb_projets ?? 1} projet(s)</span>
        </span>`
    )
    .join("");
}

function renderSkillsByDomain(competences = []) {
  const container = el("skills-by-domain");
  if (!competences.length) {
    container.innerHTML = `<p class="text-sm text-taupe">Aucune compétence renseignée.</p>`;
    return;
  }

  const grouped = {};
  competences.forEach((c) => {
    const dom = c.domaine || "autres";
    if (!grouped[dom]) grouped[dom] = [];
    grouped[dom].push(c);
  });

  container.innerHTML = Object.entries(grouped)
    .map(([dom, list]) => {
      const title = DOMAIN_LABELS[dom] || dom;
      const itemsHtml = list
        .map((skill) => {
          const lvl = Math.min(5, Math.max(1, skill.niveau || 3));
          const dots = Array.from({ length: 5 }, (_, idx) =>
            `<span class="w-2 h-2 rounded-full ${idx < lvl ? "bg-sage" : "bg-sand"}"></span>`
          ).join("");
          return `
            <div class="flex items-center justify-between py-2 border-b border-sand/60 last:border-0">
              <span class="text-sm font-medium text-espresso">${skill.nom || skill.skill_slug}</span>
              <div class="flex items-center gap-1" title="Niveau ${lvl}/5">${dots}</div>
            </div>
          `;
        })
        .join("");

      return `
        <article class="bg-oat border border-sand rounded-3xl p-6 shadow-card space-y-3">
          <span class="text-xs uppercase tracking-widest text-sage font-semibold">${dom}</span>
          <h3 class="font-serif text-2xl font-semibold text-espresso">${title}</h3>
          <div class="pt-1">${itemsHtml}</div>
        </article>
      `;
    })
    .join("");
}

function renderFormations(formations = []) {
  const container = el("formations-list");
  if (!formations.length) {
    container.innerHTML = `<p class="text-sm text-taupe">Aucune formation renseignée.</p>`;
    return;
  }
  container.innerHTML = formations
    .map((f) => {
      const finLabel = f.fin === null ? "En cours" : f.fin || "";
      const periode = [f.debut, finLabel].filter(Boolean).join(" → ");
      return `
        <article class="bg-oat border border-sand rounded-3xl p-6 shadow-card space-y-1.5">
          <span class="text-xs font-medium text-sage">${[periode, f.lieu].filter(Boolean).join(" • ")}</span>
          <h4 class="font-serif text-2xl font-semibold text-espresso">${f.diplome || "Diplôme"}</h4>
          <p class="text-sm text-taupe font-medium">${f.ecole || ""}</p>
        </article>
      `;
    })
    .join("");
}

function renderExperiences(exps = []) {
  const container = el("experiences-list");
  if (!exps.length) {
    container.innerHTML = `<p class="text-sm text-taupe">Aucune expérience trouvée pour ce filtre.</p>`;
    return;
  }
  container.innerHTML = exps
    .map((exp) => {
      const finLabel = exp.fin === null ? "En cours" : exp.fin || "";
      const periode = [exp.debut, finLabel].filter(Boolean).join(" → ");
      const meta = [periode, exp.lieu].filter(Boolean).join(" • ");
      return `
        <article class="bg-oat border border-sand rounded-3xl p-6 sm:p-7 shadow-card space-y-3 hover:border-clay transition">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h3 class="font-serif text-2xl font-semibold text-espresso">${exp.poste || "Poste"}</h3>
              <p class="text-sm font-medium text-sage">${exp.entreprise || ""}</p>
            </div>
            <span class="text-xs px-3 py-1 rounded-full bg-linen text-taupe border border-sand w-fit">${meta}</span>
          </div>
          <p class="text-sm text-espresso/80 leading-relaxed">${exp.description || ""}</p>
          <div class="pt-1 flex flex-wrap gap-1.5">${renderBadges(exp.competences)}</div>
        </article>
      `;
    })
    .join("");
}

async function openProjectDetail(projetSlug) {
  const panel = el("projet-detail");
  panel.classList.remove("hidden");
  el("detail-titre").textContent = "Chargement...";
  el("detail-description").textContent = "";
  el("detail-links").innerHTML = "";
  el("detail-badges").innerHTML = "";
  el("detail-similaires").innerHTML = `<p class="text-xs text-taupe">Recherche des projets similaires...</p>`;

  let projet = null;
  try {
    projet = await apiGet(`/api/projets/${encodeURIComponent(projetSlug)}`, { candidat_slug: CANDIDAT_SLUG });
  } catch {
    projet = DEMO_PROJETS.find((p) => p.projet_slug === projetSlug) || { titre: projetSlug };
  }

  el("detail-titre").textContent = projet.titre || projetSlug;
  el("detail-description").textContent = projet.description_longue || projet.description || "";
  el("detail-badges").innerHTML = renderBadges(projet.competences || []);

  const links = [];
  if (projet.lien_repo) {
    links.push(`<a href="${projet.lien_repo}" target="_blank" rel="noreferrer" class="px-4 py-2 rounded-full bg-espresso text-cream hover:opacity-90 transition">Voir le dépôt GitHub ↗</a>`);
  }
  if (projet.lien_demo) {
    links.push(`<a href="${projet.lien_demo}" target="_blank" rel="noreferrer" class="px-4 py-2 rounded-full bg-sage text-cream hover:opacity-90 transition">Démo live ↗</a>`);
  }
  el("detail-links").innerHTML = links.join("");

  try {
    const simRes = await apiGet(`/api/graph/projets/${encodeURIComponent(projetSlug)}/similaires`, {
      candidat_slug: CANDIDAT_SLUG,
      limit: 4
    });
    const items = simRes.items || simRes || [];
    if (!items.length) {
      el("detail-similaires").innerHTML = `<p class="text-xs text-taupe">Aucun projet similaire trouvé.</p>`;
    } else {
      el("detail-similaires").innerHTML = items
        .map(
          (s) => `
          <div class="bg-cream border border-sand rounded-2xl p-4 flex items-center justify-between gap-2">
            <div>
              <p class="text-sm font-semibold text-espresso">${s.titre || s.projet_slug}</p>
              <p class="text-xs text-taupe">${s.nb_communes ?? 0} compétence(s) en commun</p>
            </div>
            <button data-slug="${s.projet_slug}" class="btn-sim-open text-xs font-semibold text-sage hover:underline">Ouvrir →</button>
          </div>
        `
        )
        .join("");

      el("detail-similaires").querySelectorAll(".btn-sim-open").forEach((b) => {
        b.addEventListener("click", () => openProjectDetail(b.dataset.slug));
      });
    }
  } catch {
    el("detail-similaires").innerHTML = `<p class="text-xs text-taupe">Similarités Neo4j disponibles une fois le graphe synchronisé.</p>`;
  }

  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderProjets(projets = []) {
  const grid = el("projets-grid");
  if (!projets.length) {
    grid.innerHTML = `<p class="text-sm text-taupe">Aucun projet trouvé pour ce filtre.</p>`;
    return;
  }
  grid.innerHTML = projets
    .map(
      (p) => `
      <article class="bg-oat border border-sand rounded-3xl p-6 sm:p-7 shadow-card flex flex-col justify-between gap-5 hover:border-clay transition">
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs uppercase tracking-widest text-sage font-semibold">${p.contexte || "Projet"}</span>
            ${p.annee ? `<span class="text-xs px-2.5 py-0.5 rounded-full bg-linen text-taupe">${p.annee}</span>` : ""}
          </div>
          <h3 class="font-serif text-2xl font-semibold text-espresso">${p.titre || "Projet"}</h3>
          <p class="text-sm text-espresso/80 leading-relaxed">${p.description || ""}</p>
        </div>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-1.5">${renderBadges(p.competences)}</div>
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-sand/60">
            ${
              p.projet_slug
                ? `<button data-slug="${p.projet_slug}" class="btn-detail text-xs font-semibold text-espresso hover:text-sage transition">Voir les détails →</button>`
                : ""
            }
            ${
              p.lien_repo
                ? `<a href="${p.lien_repo}" target="_blank" rel="noreferrer" class="text-xs font-medium text-taupe hover:text-espresso underline underline-offset-4">GitHub ↗</a>`
                : ""
            }
          </div>
        </div>
      </article>
    `
    )
    .join("");

  grid.querySelectorAll(".btn-detail").forEach((btn) => {
    btn.addEventListener("click", () => openProjectDetail(btn.dataset.slug));
  });
}

async function loadGraph() {
  try {
    const graph = await apiGet("/api/graph/competences", { candidat_slug: CANDIDAT_SLUG });
    const nodes = graph.nodes || [];
    const links = graph.links || [];
    el("nodes-count").textContent = nodes.length;
    el("links-count").textContent = links.length;

    el("graph-nodes").innerHTML = nodes.length
      ? nodes
          .map(
            (n) =>
              `<div class="px-3 py-2 rounded-xl bg-cream border border-sand/70 flex items-center justify-between">
                <span class="font-medium text-espresso">${n.label}</span>
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-sageLight text-sage">${n.type}</span>
              </div>`
          )
          .join("")
      : `<p class="text-taupe">Aucun nœud retourné.</p>`;

    el("graph-links").innerHTML = links.length
      ? links
          .map(
            (l) =>
              `<div class="px-3 py-2 rounded-xl bg-cream border border-sand/70">
                <span class="font-medium text-espresso">${l.source}</span>
                <span class="text-sage font-semibold mx-1">— ${l.type} →</span>
                <span class="font-medium text-espresso">${l.target}</span>
              </div>`
          )
          .join("")
      : `<p class="text-taupe">Aucune relation retournée.</p>`;
  } catch (err) {
    el("graph-nodes").innerHTML = `<p class="text-taupe">Graphe indisponible (${err.message}).</p>`;
    el("graph-links").innerHTML = "";
  }
}

async function loadDomain() {
  const domaineSlug = el("domaine-slug").value.trim();
  if (!domaineSlug) return;
  try {
    const res = await apiGet(`/api/graph/domains/${encodeURIComponent(domaineSlug)}/competences`, {
      candidat_slug: CANDIDAT_SLUG
    });
    const items = res.items || [];
    el("domain-result").innerHTML = items.length
      ? renderBadges(items.map((i) => `${i.nom || i.skill_slug}`))
      : `<span class="text-xs text-taupe">Aucune compétence trouvée pour ce domaine.</span>`;
  } catch {
    const fallback = DEMO_PROFIL.competences.filter((c) => c.domaine === domaineSlug);
    el("domain-result").innerHTML = fallback.length
      ? renderBadges(fallback.map((c) => c.nom))
      : `<span class="text-xs text-taupe">Aucune compétence pour ce domaine.</span>`;
  }
}

function setReloading(isLoading) {
  const icon = el("reload-icon");
  const label = el("reload-label");
  if (!icon || !label) return;
  icon.classList.toggle("animate-spin", isLoading);
  label.textContent = isLoading ? "Synchro..." : "Actualiser";
}

async function loadAll() {
  setReloading(true);
  const lieu = el("filter-lieu").value.trim();
  const competence = el("filter-competence").value.trim();

  try {
    const profil = await apiGet("/api/profil", { candidat_slug: CANDIDAT_SLUG });
    const fullName = `${profil.prenom || ""} ${profil.nom || ""}`.trim();
    el("hero-name").textContent = fullName || "Beleive Tossou";
    el("hero-title").textContent = profil.titre || DEMO_PROFIL.titre;
    el("hero-bio").textContent = profil.bio || DEMO_PROFIL.bio;
    el("status-badge").textContent = "Connecté à l'API FastAPI";
    el("status-badge").className = "text-xs px-3 py-1 rounded-full bg-sageLight text-sage font-medium";

    if (profil.email) {
      el("contact-email-link").href = `mailto:${profil.email}`;
      el("contact-email-text").textContent = profil.email;
    }
    if (profil.liens?.linkedin) el("contact-linkedin-link").href = profil.liens.linkedin;
    if (profil.liens?.github) el("contact-github-link").href = profil.liens.github;

    renderFormations(profil.formations || DEMO_PROFIL.formations);
    renderSkillsByDomain(profil.competences || DEMO_PROFIL.competences);
  } catch {
    el("hero-name").textContent = `${DEMO_PROFIL.prenom} ${DEMO_PROFIL.nom}`;
    el("hero-title").textContent = DEMO_PROFIL.titre;
    el("hero-bio").textContent = DEMO_PROFIL.bio;
    el("status-badge").textContent = "Aperçu local";
    renderFormations(DEMO_PROFIL.formations);
    renderSkillsByDomain(DEMO_PROFIL.competences);
  }

  try {
    const stats = await apiGet("/api/stats/competences", { candidat_slug: CANDIDAT_SLUG, limit: 6 });
    renderTopSkills(stats.items || []);
  } catch {
    renderTopSkills(
      DEMO_PROFIL.competences.slice(0, 6).map((c) => ({ ...c, nb_projets: 2 }))
    );
  }

  try {
    const expRes = await apiGet("/api/experiences", { candidat_slug: CANDIDAT_SLUG, lieu });
    renderExperiences(expRes.items || []);
  } catch {
    const filtered = DEMO_PROFIL.experiences.filter(
      (e) => !lieu || (e.lieu || "").toLowerCase().includes(lieu.toLowerCase())
    );
    renderExperiences(filtered);
  }

  try {
    const projRes = await apiGet("/api/projets", { candidat_slug: CANDIDAT_SLUG, competence });
    renderProjets(projRes.items || []);
  } catch {
    const filtered = DEMO_PROJETS.filter(
      (p) =>
        !competence ||
        (p.competences || []).some((c) => c.toLowerCase().includes(competence.toLowerCase()))
    );
    renderProjets(filtered);
  }

  setReloading(false);
}

// Événements jeu 2D
window.addEventListener("keydown", (e) => {
  if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A" || e.key === "q" || e.key === "Q") {
    gameState.keys.left = true;
  } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    gameState.keys.right = true;
  } else if (e.key === "Enter" && el("page-accueil")?.classList.contains("active") && !gameState.hidden) {
    const { station, dist } = getNearestStation();
    if (dist < 75) navigateTo(station.id);
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A" || e.key === "q" || e.key === "Q") {
    gameState.keys.left = false;
  } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    gameState.keys.right = false;
  }
});

el("clean-girl-canvas")?.addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * e.target.width;
  const clickedStation = STATIONS.find((st) => Math.abs(clickX - st.x) < 62);
  if (clickedStation) {
    focusStation(clickedStation.id);
  } else {
    gameState.targetX = clickX;
    gameState.autoEnterTarget = null;
  }
});

el("btn-move-left")?.addEventListener("pointerdown", () => { gameState.keys.left = true; });
el("btn-move-left")?.addEventListener("pointerup", () => { gameState.keys.left = false; });
el("btn-move-left")?.addEventListener("pointerleave", () => { gameState.keys.left = false; });

el("btn-move-right")?.addEventListener("pointerdown", () => { gameState.keys.right = true; });
el("btn-move-right")?.addEventListener("pointerup", () => { gameState.keys.right = false; });
el("btn-move-right")?.addEventListener("pointerleave", () => { gameState.keys.right = false; });

el("btn-enter-station")?.addEventListener("click", () => {
  const { station } = getNearestStation();
  focusStation(station.id);
});

el("btn-reload").addEventListener("click", loadAll);
el("api-url").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadAll();
});
el("filter-lieu").addEventListener("input", loadAll);
el("filter-competence").addEventListener("input", loadAll);
el("btn-close-detail").addEventListener("click", () => el("projet-detail").classList.add("hidden"));
el("btn-load-graph").addEventListener("click", loadGraph);
el("btn-load-domain").addEventListener("click", loadDomain);

navigateTo("accueil");
loadAll();
updateGameLoop();