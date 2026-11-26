// Types alignés sur API_ROUTES.md (contrat d'interface de l'équipe).
// Dates au format YYYY-MM ; fin: null = en cours.
export interface Experience {
  entreprise: string
  poste: string
  lieu: string
  debut: string
  fin: string | null
  description?: string | null
  competences?: string[]
}

export interface Formation {
  ecole: string
  diplome: string
  lieu?: string | null
  debut: string
  fin: string | null
}

export interface CompetenceProfil {
  skill_slug: string
  nom: string
  domaine: string
  niveau: number
}

export interface Profil {
  candidat_slug: string
  prenom: string
  nom: string
  titre: string
  bio: string
  email: string
  liens: { github?: string; linkedin?: string }
  experiences: Experience[]
  formations: Formation[]
  competences: CompetenceProfil[]
}

export interface ProjetResume {
  projet_slug: string
  titre: string
  description: string
  annee: number
  competences: string[]
  lien_repo?: string | null
  lien_demo?: string | null
}

export interface ProjetDetail extends ProjetResume {
  description_longue?: string | null
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface ItemsResponse<T> {
  items: T[]
  total: number
}

export interface StatCompetence {
  skill_slug: string
  nom: string
  domaine: string
  niveau: number
  nb_projets: number
  derniere_annee: number
}

export interface ProjetSimilaire {
  projet_slug: string
  titre: string
  competences_communes: string[]
  nb_communes: number
}

export interface Similaires {
  projet_slug: string
  items: ProjetSimilaire[]
}

export type GraphNodeType = 'candidat' | 'projet' | 'competence' | 'domaine'

export interface GraphNode {
  id: string
  type: GraphNodeType
  label: string
  annee?: number
  niveau?: number
}

export interface GraphLink {
  source: string
  target: string
  type: 'A_REALISE' | 'UTILISE' | 'APPARTIENT_A'
}

export interface Graphe {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface DomaineCompetences {
  domaine_slug: string
  domaine_nom: string
  items: { skill_slug: string; nom: string }[]
}
