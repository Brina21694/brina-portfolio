// Toutes les routes de l'API de l'équipe (API_ROUTES.md) passent par ce fichier.
// VITE_USE_MOCK=true : mêmes fonctions, mais avec des données locales (aucun backend nécessaire).
import { getJson, ApiError } from '@/lib/http'
import { MOCK_DOMAINES, MOCK_PROFIL, MOCK_PROJETS } from '@/mocks/seed'
import type {
  DomaineCompetences,
  Experience,
  Graphe,
  GraphLink,
  GraphNode,
  ItemsResponse,
  Page,
  Profil,
  ProjetDetail,
  ProjetResume,
  Similaires,
  StatCompetence,
} from '@/types/api'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const norm = (s: string) => s.trim().toLowerCase()

// --- Version réelle ---------------------------------------------------------

// Accepte {items,total} (contrat) ou une simple liste.
function asItems<T>(raw: ItemsResponse<T> | T[]): ItemsResponse<T> {
  return Array.isArray(raw) ? { items: raw, total: raw.length } : raw
}

// Le profil sert à plusieurs sections : un seul appel partagé (vidé en cas d'échec pour permettre « Réessayer »).
let profilCache: Promise<Profil> | null = null

function getProfilReal(): Promise<Profil> {
  profilCache ??= getJson<Profil>('/api/profil').catch((e: unknown) => {
    profilCache = null
    throw e
  })
  return profilCache
}

const real = {
  getProfil: getProfilReal,
  // Le contrat promet {items,total,page,size}, mais certains backends renvoient une simple liste :
  // on accepte les deux et on filtre / pagine côté navigateur si besoin.
  getProjets: async (p: { competence?: string; page?: number; size?: number }, signal?: AbortSignal) => {
    const raw = await getJson<Page<ProjetResume> | ProjetResume[]>('/api/projets', p, signal)
    if (!Array.isArray(raw)) return raw
    const page = p.page ?? 1
    const size = p.size ?? 20
    const all = raw
      .filter((x) => !p.competence || x.competences.includes(p.competence))
      .sort((a, b) => b.annee - a.annee)
    return { items: all.slice((page - 1) * size, page * size), total: all.length, page, size }
  },
  getProjet: (slug: string, signal?: AbortSignal) =>
    getJson<ProjetDetail>(`/api/projets/${encodeURIComponent(slug)}`, undefined, signal),
  getExperiences: async (lieu?: string, signal?: AbortSignal) =>
    asItems(await getJson<ItemsResponse<Experience> | Experience[]>('/api/experiences', { lieu }, signal)),
  getStats: async (limit?: number, signal?: AbortSignal) =>
    asItems(await getJson<ItemsResponse<StatCompetence> | StatCompetence[]>('/api/stats/competences', { limit }, signal)),
  getSimilaires: (slug: string, signal?: AbortSignal) =>
    getJson<Similaires>(`/api/graph/projets/${encodeURIComponent(slug)}/similaires`, undefined, signal),
  getGraph: (signal?: AbortSignal) => getJson<Graphe>('/api/graph/competences', undefined, signal),
  getDomaine: (slug: string, signal?: AbortSignal) =>
    getJson<DomaineCompetences>(`/api/graph/domaines/${encodeURIComponent(slug)}/competences`, undefined, signal),
}

// --- Version d'exemple (mêmes formes de réponse) -----------------------------

const stats = (): StatCompetence[] =>
  MOCK_PROFIL.competences
    .map((comp) => {
      const used = MOCK_PROJETS.filter((p) => p.competences.includes(comp.skill_slug))
      return {
        ...comp,
        nb_projets: used.length,
        derniere_annee: Math.max(0, ...used.map((p) => p.annee)),
      }
    })
    .filter((s) => s.nb_projets > 0)
    .sort((a, b) => b.nb_projets - a.nb_projets || a.skill_slug.localeCompare(b.skill_slug))

const mock: typeof real = {
  getProfil: async () => MOCK_PROFIL,
  getProjets: async ({ competence, page = 1, size = 20 }) => {
    const list = MOCK_PROJETS.filter((p) => !competence || p.competences.includes(competence))
      .sort((a, b) => b.annee - a.annee)
      .map((p) => {
        const { description_longue, ...short } = p
        void description_longue
        return short
      })
    return { items: list.slice((page - 1) * size, page * size), total: list.length, page, size }
  },
  getProjet: async (slug) => {
    const found = MOCK_PROJETS.find((p) => p.projet_slug === slug)
    if (!found) throw new ApiError('http 404', 404)
    return found
  },
  getExperiences: async (lieu) => {
    const items = MOCK_PROFIL.experiences.filter((e) => !lieu || norm(e.lieu) === norm(lieu))
    return { items, total: items.length }
  },
  getStats: async (limit) => {
    const items = stats().slice(0, limit)
    return { items, total: items.length }
  },
  getSimilaires: async (slug) => {
    const base = MOCK_PROJETS.find((p) => p.projet_slug === slug)
    if (!base) throw new ApiError('http 404', 404)
    const items = MOCK_PROJETS.filter((p) => p.projet_slug !== slug)
      .map((p) => {
        const communes = p.competences.filter((s) => base.competences.includes(s))
        return { projet_slug: p.projet_slug, titre: p.titre, competences_communes: communes, nb_communes: communes.length }
      })
      .filter((p) => p.nb_communes > 0)
      .sort((a, b) => b.nb_communes - a.nb_communes)
    return { projet_slug: slug, items }
  },
  getGraph: async () => {
    const nodes: GraphNode[] = [
      { id: `candidat:${MOCK_PROFIL.candidat_slug}`, type: 'candidat', label: `${MOCK_PROFIL.prenom} ${MOCK_PROFIL.nom}` },
    ]
    const links: GraphLink[] = []
    const used = new Set<string>()
    for (const p of MOCK_PROJETS) {
      nodes.push({ id: `projet:${p.projet_slug}`, type: 'projet', label: p.titre, annee: p.annee })
      links.push({ source: nodes[0].id, target: `projet:${p.projet_slug}`, type: 'A_REALISE' })
      for (const s of p.competences) {
        used.add(s)
        links.push({ source: `projet:${p.projet_slug}`, target: `competence:${s}`, type: 'UTILISE' })
      }
    }
    const domaines = new Set<string>()
    for (const comp of MOCK_PROFIL.competences.filter((x) => used.has(x.skill_slug))) {
      nodes.push({ id: `competence:${comp.skill_slug}`, type: 'competence', label: comp.nom, niveau: comp.niveau })
      links.push({ source: `competence:${comp.skill_slug}`, target: `domaine:${comp.domaine}`, type: 'APPARTIENT_A' })
      domaines.add(comp.domaine)
    }
    for (const d of domaines) nodes.push({ id: `domaine:${d}`, type: 'domaine', label: MOCK_DOMAINES[d] ?? d })
    return { nodes, links }
  },
  getDomaine: async (slug) => {
    if (!MOCK_DOMAINES[slug]) throw new ApiError('http 404', 404)
    const items = MOCK_PROFIL.competences
      .filter((c) => c.domaine === slug)
      .map((c) => ({ skill_slug: c.skill_slug, nom: c.nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom))
    return { domaine_slug: slug, domaine_nom: MOCK_DOMAINES[slug], items }
  },
}

export const api = USE_MOCK ? mock : real
