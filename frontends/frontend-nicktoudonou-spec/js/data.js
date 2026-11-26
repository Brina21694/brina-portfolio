/* ==========================================================================
   DATA — charge les données de l'API, les met en forme, et les garde en
   mémoire pour ne pas rappeler l'API à chaque changement de page.
   Chaque fonction correspond à une route de API_ROUTES.md.
   ========================================================================== */

import { get } from "./api.js";
import { CONFIG } from "./config.js";

const cache = new Map();

/* Mémorise une promesse ; en cas d'erreur on l'oublie pour pouvoir réessayer. */
function once(key, loader) {
  if (!cache.has(key)) {
    cache.set(key, loader().catch((error) => { cache.delete(key); throw error; }));
  }
  return cache.get(key);
}

export function clearCache() { cache.clear(); }

/* ---------- Route 1 : profil ---------- */

export const loadProfil = () => once("profil", () => get("/api/profil"));

/* ---------- Routes 2 et 3 : projets ---------- */

/* Met un projet au même format, quelle que soit la forme exacte renvoyée. */
export function normaliseProjet(p) {
  return {
    slug: p.projet_slug,
    titre: p.titre ?? p.projet_slug,
    description: p.description ?? "",
    descriptionLongue: p.description_longue ?? "",
    annee: p.annee ?? null,
    competences: Array.isArray(p.competences) ? p.competences : [],
    repo: p.lien_repo ?? p.liens?.github ?? null,
    demo: p.lien_demo ?? p.liens?.demo ?? null,
    image: Array.isArray(p.images) && p.images.length ? p.images[0] : null,
    metriques: p.metriques && typeof p.metriques === "object" ? p.metriques : null,
    etude: {
      contexte: p.contexte,
      probleme: p.probleme,
      objectifs: p.objectifs,
      donnees: p.donnees,
      methodologie: p.methodologie,
      resultats: p.resultats,
      enseignements: p.enseignements,
    },
  };
}

/* Garde seulement MES projets si l'API renvoie ceux de toute l'équipe. */
function estAMoi(p) {
  const me = CONFIG.candidatSlug;
  if (Array.isArray(p.candidat_slugs)) return p.candidat_slugs.includes(me);
  if (p.candidat_slug) return p.candidat_slug === me;
  return true;
}

function trierParAnnee(list) {
  return [...list].sort((a, b) => (b.annee ?? 0) - (a.annee ?? 0) || a.titre.localeCompare(b.titre));
}

export const loadProjets = (competence = "") => once(`projets:${competence}`, async () => {
  const data = await get("/api/projets", { competence, size: 100 });
  const items = Array.isArray(data) ? data : data.items ?? [];
  return trierParAnnee(items.filter(estAMoi).map(normaliseProjet));
});

export const loadProjet = (slug) => once(`projet:${slug}`, async () =>
  normaliseProjet(await get(`/api/projets/${encodeURIComponent(slug)}`)));

/* ---------- Route 4 : expériences (avec repli sur le profil) ---------- */

export async function loadExperiences(lieu = "") {
  try {
    const data = await get("/api/experiences", { lieu });
    return { items: data.items ?? data, source: "api" };
  } catch (error) {
    const profil = await loadProfil();
    const items = (profil.experiences ?? []).filter(
      (x) => !lieu || String(x.lieu ?? "").toLowerCase() === lieu.toLowerCase(),
    );
    return { items, source: "profil", error };
  }
}

/* ---------- Route 5 : statistiques (avec calcul local de secours) ---------- */

export const loadStats = () => once("stats", async () => {
  const profil = await loadProfil().catch(() => ({ competences: [] }));
  const infos = new Map((profil.competences ?? []).map((c) => [c.skill_slug, c]));

  let items = [];
  let source = "MongoDB · $group";
  try {
    const data = await get("/api/stats/competences");
    items = data.items ?? [];
  } catch { /* on calcule localement ci-dessous */ }

  if (!items.length) {
    const projets = await loadProjets();
    const map = new Map();
    for (const p of projets) {
      for (const slug of p.competences) {
        const e = map.get(slug) ?? { skill_slug: slug, nb_projets: 0, derniere_annee: null };
        e.nb_projets += 1;
        if (p.annee && p.annee > (e.derniere_annee ?? 0)) e.derniere_annee = p.annee;
        map.set(slug, e);
      }
    }
    items = [...map.values()].sort((a, b) => b.nb_projets - a.nb_projets || a.skill_slug.localeCompare(b.skill_slug));
    source = "calcul local · projets";
  }

  items = items.map((s) => ({
    ...s,
    nom: s.nom ?? infos.get(s.skill_slug)?.nom ?? s.skill_slug,
    domaine: s.domaine ?? infos.get(s.skill_slug)?.domaine ?? null,
  }));

  const utilisees = new Set(items.map((s) => s.skill_slug));
  const autres = (profil.competences ?? []).filter((c) => !utilisees.has(c.skill_slug));
  return { items, autres, source };
});

/* ---------- Route 6 : projets similaires (Neo4j) ---------- */

export const loadSimilaires = (slug) => once(`similaires:${slug}`, async () => {
  const data = await get(`/api/graph/projets/${encodeURIComponent(slug)}/similaires`, { limit: 3 });
  return data.items ?? [];
});

/* ---------- Route 7 : graphe de compétences (Neo4j) ---------- */

/* Ne garde que MON sous-graphe : on part de mon nœud candidat et on suit
   les flèches dans leur sens (candidat → projet → compétence → domaine). */
export function sousGraphe(graph, slug) {
  const start = `candidat:${slug}`;
  const ids = new Set(graph.nodes.map((n) => n.id));
  if (!ids.has(start)) return graph;

  const sortants = new Map();
  for (const l of graph.links) {
    if (!sortants.has(l.source)) sortants.set(l.source, []);
    sortants.get(l.source).push(l.target);
  }
  const vus = new Set([start]);
  const file = [start];
  while (file.length) {
    const id = file.shift();
    for (const next of sortants.get(id) ?? []) {
      if (!vus.has(next)) { vus.add(next); file.push(next); }
    }
  }
  return {
    nodes: graph.nodes.filter((n) => vus.has(n.id)),
    links: graph.links.filter((l) => vus.has(l.source) && vus.has(l.target)),
  };
}

export const loadGraph = () => once("graph", async () => {
  const data = await get("/api/graph/competences");
  return sousGraphe({ nodes: data.nodes ?? [], links: data.links ?? [] }, CONFIG.candidatSlug);
});
