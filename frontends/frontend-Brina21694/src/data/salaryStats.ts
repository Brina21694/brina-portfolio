// RÉSULTATS RÉELS du projet « Prédiction des salaires dans le secteur technologique ».
// Résumés calculés (moyennes, comptages) à partir du jeu de données Kaggle « Job Salary Prediction »
// (250 000 profils). Le fichier complet n'est pas inclus dans le site : seuls ces agrégats le sont.
// Les résultats des modèles et l'importance des variables viennent du notebook du projet.

export interface NamedValue {
  name: string
  value: number
}

export interface SalaryBin {
  label: string
  from: number
  to: number
  count: number
}

export type Dimension = 'job_title' | 'location' | 'company_size' | 'education_level' | 'remote_work' | 'experience_years'

export const SALARY_STATS: {
  rows: number
  mean: number
  median: number
  corrExperience: number
  histogram: SalaryBin[]
  byDimension: Record<Dimension, NamedValue[]>
} = {
 "rows": 250000,
 "mean": 145718,
 "median": 143453,
 "corrExperience": 0.438,
 "histogram": [
  {
   "label": "30k",
   "from": 30000,
   "to": 40000,
   "count": 6
  },
  {
   "label": "40k",
   "from": 40000,
   "to": 50000,
   "count": 104
  },
  {
   "label": "50k",
   "from": 50000,
   "to": 60000,
   "count": 546
  },
  {
   "label": "60k",
   "from": 60000,
   "to": 70000,
   "count": 1764
  },
  {
   "label": "70k",
   "from": 70000,
   "to": 80000,
   "count": 4190
  },
  {
   "label": "80k",
   "from": 80000,
   "to": 90000,
   "count": 7679
  },
  {
   "label": "90k",
   "from": 90000,
   "to": 100000,
   "count": 12047
  },
  {
   "label": "100k",
   "from": 100000,
   "to": 110000,
   "count": 16482
  },
  {
   "label": "110k",
   "from": 110000,
   "to": 120000,
   "count": 21249
  },
  {
   "label": "120k",
   "from": 120000,
   "to": 130000,
   "count": 24799
  },
  {
   "label": "130k",
   "from": 130000,
   "to": 140000,
   "count": 26826
  },
  {
   "label": "140k",
   "from": 140000,
   "to": 150000,
   "count": 26570
  },
  {
   "label": "150k",
   "from": 150000,
   "to": 160000,
   "count": 24858
  },
  {
   "label": "160k",
   "from": 160000,
   "to": 170000,
   "count": 21374
  },
  {
   "label": "170k",
   "from": 170000,
   "to": 180000,
   "count": 17512
  },
  {
   "label": "180k",
   "from": 180000,
   "to": 190000,
   "count": 13596
  },
  {
   "label": "190k",
   "from": 190000,
   "to": 200000,
   "count": 10065
  },
  {
   "label": "200k",
   "from": 200000,
   "to": 210000,
   "count": 7260
  },
  {
   "label": "210k",
   "from": 210000,
   "to": 220000,
   "count": 4828
  },
  {
   "label": "220k",
   "from": 220000,
   "to": 230000,
   "count": 3137
  },
  {
   "label": "230k",
   "from": 230000,
   "to": 240000,
   "count": 2149
  },
  {
   "label": "240k",
   "from": 240000,
   "to": 250000,
   "count": 1249
  },
  {
   "label": "250k",
   "from": 250000,
   "to": 260000,
   "count": 753
  },
  {
   "label": "260k",
   "from": 260000,
   "to": 270000,
   "count": 458
  },
  {
   "label": "270k",
   "from": 270000,
   "to": 280000,
   "count": 266
  },
  {
   "label": "280k",
   "from": 280000,
   "to": 290000,
   "count": 119
  },
  {
   "label": "290k",
   "from": 290000,
   "to": 300000,
   "count": 69
  },
  {
   "label": "300k",
   "from": 300000,
   "to": 310000,
   "count": 26
  },
  {
   "label": "310k",
   "from": 310000,
   "to": 320000,
   "count": 9
  },
  {
   "label": "320k",
   "from": 320000,
   "to": 330000,
   "count": 9
  },
  {
   "label": "330k",
   "from": 330000,
   "to": 340000,
   "count": 1
  }
 ],
 "byDimension": {
  "job_title": [
   {
    "name": "Data Analyst",
    "value": 119892
   },
   {
    "name": "Business Analyst",
    "value": 122551
   },
   {
    "name": "Frontend Developer",
    "value": 132654
   },
   {
    "name": "Backend Developer",
    "value": 139203
   },
   {
    "name": "Software Engineer",
    "value": 141740
   },
   {
    "name": "Data Scientist",
    "value": 147258
   },
   {
    "name": "Cybersecurity Analyst",
    "value": 148698
   },
   {
    "name": "DevOps Engineer",
    "value": 149959
   },
   {
    "name": "Cloud Engineer",
    "value": 152103
   },
   {
    "name": "Product Manager",
    "value": 157595
   },
   {
    "name": "Machine Learning Engineer",
    "value": 163023
   },
   {
    "name": "AI Engineer",
    "value": 173498
   }
  ],
  "location": [
   {
    "name": "India",
    "value": 97690
   },
   {
    "name": "Netherlands",
    "value": 139295
   },
   {
    "name": "Singapore",
    "value": 139341
   },
   {
    "name": "Australia",
    "value": 139362
   },
   {
    "name": "Sweden",
    "value": 139441
   },
   {
    "name": "Remote",
    "value": 139443
   },
   {
    "name": "Germany",
    "value": 153376
   },
   {
    "name": "UK",
    "value": 160075
   },
   {
    "name": "Canada",
    "value": 167391
   },
   {
    "name": "USA",
    "value": 181716
   }
  ],
  "company_size": [
   {
    "name": "Startup",
    "value": 127289
   },
   {
    "name": "Small",
    "value": 134357
   },
   {
    "name": "Medium",
    "value": 141538
   },
   {
    "name": "Large",
    "value": 155711
   },
   {
    "name": "Enterprise",
    "value": 169616
   }
  ],
  "education_level": [
   {
    "name": "High School",
    "value": 131715
   },
   {
    "name": "Diploma",
    "value": 137159
   },
   {
    "name": "Bachelor",
    "value": 142411
   },
   {
    "name": "Master",
    "value": 153305
   },
   {
    "name": "PhD",
    "value": 163976
   }
  ],
  "remote_work": [
   {
    "name": "No",
    "value": 143932
   },
   {
    "name": "Hybrid",
    "value": 143970
   },
   {
    "name": "Yes",
    "value": 149280
   }
  ],
  "experience_years": [
   {
    "name": "0",
    "value": 118873
   },
   {
    "name": "1",
    "value": 121251
   },
   {
    "name": "2",
    "value": 124229
   },
   {
    "name": "3",
    "value": 126922
   },
   {
    "name": "4",
    "value": 129689
   },
   {
    "name": "5",
    "value": 131787
   },
   {
    "name": "6",
    "value": 134898
   },
   {
    "name": "7",
    "value": 137561
   },
   {
    "name": "8",
    "value": 140668
   },
   {
    "name": "9",
    "value": 142764
   },
   {
    "name": "10",
    "value": 145772
   },
   {
    "name": "11",
    "value": 148133
   },
   {
    "name": "12",
    "value": 150779
   },
   {
    "name": "13",
    "value": 154083
   },
   {
    "name": "14",
    "value": 156413
   },
   {
    "name": "15",
    "value": 158981
   },
   {
    "name": "16",
    "value": 162291
   },
   {
    "name": "17",
    "value": 164282
   },
   {
    "name": "18",
    "value": 167421
   },
   {
    "name": "19",
    "value": 169797
   },
   {
    "name": "20",
    "value": 173180
   }
  ]
 }
}

export const DIMENSIONS: Dimension[] = ['job_title', 'location', 'company_size', 'education_level', 'remote_work', 'experience_years']

// Résultats des trois modèles (notebook du projet, jeu de test de 49 998 profils)
export const MODEL_RESULTS = [
  { name: 'regression', r2: 0.2727, mae: 25090, rmse: 31856 },
  { name: 'tree', r2: 0.4299, mae: 21843, rmse: 28205 },
  { name: 'forest', r2: 0.4018, mae: 22465, rmse: 28890 },
]

// Importance des variables dans la forêt aléatoire (en %, notebook du projet)
export const FEATURE_IMPORTANCE: NamedValue[] = [
  { name: 'certifications', value: 3.0 },
  { name: 'remote_work', value: 4.59 },
  { name: 'skills_count', value: 5.49 },
  { name: 'exp_skills_ratio', value: 8.87 },
  { name: 'education_level', value: 10.95 },
  { name: 'industry', value: 11.19 },
  { name: 'profil_score', value: 16.44 },
  { name: 'job_title', value: 17.57 },
  { name: 'experience_years', value: 21.9 },
]
