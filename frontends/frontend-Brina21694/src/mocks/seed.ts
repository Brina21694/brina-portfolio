// Données d'exemple (VITE_USE_MOCK=true) : mêmes formes que le contrat API_ROUTES.md.
// Contenu tiré du CV et des notebooks de Brina. À VÉRIFIER :
//  - les mois de début/fin des formations et du stage (seules les années / « juin–juillet 2023 » sont connues) ;
//  - `niveau` : valeur provisoire (champ obligatoire côté API), jamais affichée sur le site.
import type { Profil, ProjetDetail } from '@/types/api'

export const MOCK_DOMAINES: Record<string, string> = {
  langages: 'Langages',
  'bases-de-donnees': 'Bases de données',
  'data-analysis': 'Analyse de données',
  'big-data': 'Big Data',
  'data-visualization': 'Business Intelligence',
  'machine-learning': 'Machine Learning',
}

const c = (skill_slug: string, nom: string, domaine: string) => ({ skill_slug, nom, domaine, niveau: 3 })

export const MOCK_PROFIL: Profil = {
  candidat_slug: 'brina-achouke',
  prenom: 'Brina',
  nom: 'Achouke',
  titre: 'Élève-ingénieure Big Data — ESIGELEC',
  bio: 'Élève-ingénieure en Big Data, je développe mes compétences en analyse de données, Big Data et Business Intelligence.',
  email: 'brina.achouke@groupe-esigelec.org',
  liens: { linkedin: 'https://www.linkedin.com/in/brina-achouke' },
  experiences: [
    {
      entreprise: 'Société des Aéroports du Bénin',
      poste: 'Technicienne IT (stage)',
      lieu: 'Cotonou',
      debut: '2023-06',
      fin: '2023-07',
      description: 'Assistance à la gestion du réseau informatique interne et soutien à la maintenance des systèmes.',
      competences: [],
    },
  ],
  formations: [
    {
      ecole: 'ESIGELEC',
      diplome: 'Cycle ingénieur Big Data pour la transformation numérique',
      lieu: 'Saint-Étienne-du-Rouvray',
      debut: '2024-09',
      fin: '2027-06',
    },
    {
      ecole: 'Père Aupiais',
      diplome: 'Cycle préparatoire scientifique',
      lieu: 'Cotonou',
      debut: '2022-09',
      fin: '2024-06',
    },
  ],
  competences: [
    c('python', 'Python', 'langages'),
    c('sql', 'SQL', 'bases-de-donnees'),
    c('pandas', 'Pandas', 'data-analysis'),
    c('numpy', 'NumPy', 'data-analysis'),
    c('matplotlib', 'Matplotlib', 'data-analysis'),
    c('seaborn', 'Seaborn', 'data-analysis'),
    c('pyspark', 'PySpark', 'big-data'),
    c('spark-sql', 'Spark SQL', 'big-data'),
    c('spark-ml', 'Spark ML', 'big-data'),
    c('powerbi', 'Power BI', 'data-visualization'),
    c('power-query', 'Power Query', 'data-visualization'),
    c('dax', 'DAX', 'data-visualization'),
    c('scikit-learn', 'Scikit-learn', 'machine-learning'),
  ],
}

export const MOCK_PROJETS: ProjetDetail[] = [
  {
    projet_slug: 'prediction-salaires-tech',
    titre: 'Prédiction des salaires dans le secteur technologique',
    description:
      'Comparaison de trois modèles de Machine Learning pour prédire un salaire à partir du profil, sur 250 000 profils.',
    description_longue:
      'Analyse d’un jeu de données Kaggle de 250 000 profils : exploration, corrélations, puis comparaison d’une régression linéaire, d’un arbre de décision et d’une forêt aléatoire. Le meilleur modèle est l’arbre de décision (R² de 0,43).',
    annee: 2026,
    competences: ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'scikit-learn'],
    lien_repo: null,
    lien_demo: null,
  },
  {
    projet_slug: 'pilotage-prets-immobiliers',
    titre: 'Tableau de bord de pilotage des prêts immobiliers',
    description:
      'Un tableau de bord Power BI de 5 pages pour une banque fictive, afin de décider plus vite et de mieux valider les dossiers de prêts.',
    description_longue:
      'Tableau de bord Power BI en 5 pages construit sur les prêts d’une banque fictive (2018–2021), avec préparation des données dans Power Query et indicateurs en DAX.',
    annee: 2026,
    competences: ['powerbi', 'power-query', 'dax'],
    lien_repo: null,
    lien_demo: null,
  },
  {
    projet_slug: 'analyse-velib-spark',
    titre: 'Analyse de données Vélib à grande échelle',
    description:
      'Traitement de plus de 4,8 millions de lignes de logs avec PySpark et Spark SQL, puis prédiction du sexe d’un cycliste avec Spark ML.',
    description_longue:
      'Traitement de 4 868 396 lignes de logs Vélib avec PySpark et Spark SQL, puis comparaison de trois modèles Spark ML (forêt aléatoire, arbre de décision, régression logistique).',
    annee: 2025,
    competences: ['pyspark', 'spark-sql', 'spark-ml', 'python'],
    lien_repo: null,
    lien_demo: null,
  },
]
