import { useApi } from '@/hooks/useApi'
import { api } from '@/services/api'

// Transforme un skill_slug (« scikit-learn ») en nom lisible (« Scikit-learn ») grâce au profil.
export function useSkillNames(): (slug: string) => string {
  const { data } = useApi(() => api.getProfil())
  const names = new Map((data?.competences ?? []).map((c) => [c.skill_slug, c.nom]))
  return (slug) => names.get(slug) ?? slug
}
