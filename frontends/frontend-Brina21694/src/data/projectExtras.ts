// Contenu éditorial riche (contexte, méthode, résultats, images) qui n'existe pas dans le contrat d'API.
// Il est rattaché au projet par son `projet_slug` et ne sert qu'à enrichir ce que l'API renvoie.
// Textes dans translations/ (projects.items.<key>), chiffres issus des notebooks et du CV de Brina.
export interface ProjectExtra {
  key: 'loans' | 'salary' | 'velib'
  images: string[]
}

export const PROJECT_EXTRAS: Record<string, ProjectExtra> = {
  'pilotage-prets-immobiliers': { key: 'loans', images: [] },
  'prediction-salaires-tech': {
    key: 'salary',
    images: ['/projects/salary-importance.png', '/projects/salary-correlation.png'],
  },
  'analyse-velib-spark': { key: 'velib', images: ['/projects/velib-models.png'] },
}
