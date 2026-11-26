# Portfolio ACHOUKE Brina

Frontend personnel de **Brina Achouke** (pseudo GitHub : `Brina21694`), étudiante ingénieure en Big Data à l'ESIGELEC.
Il fait partie du projet de groupe « Portfolio Polyglotte » (équipe **blackhat**).

Le site présente un portfolio Data Analytics / Business Intelligence : accueil avec globe numérique, à propos, projets, Data Lab, compétences, parcours, vision et contact. Il est disponible en **français et en anglais** (sélecteur FR / EN dans le menu).

## Technologies

| Rôle | Outil |
| --- | --- |
| Framework | React 19 + TypeScript |
| Outil de build | Vite 8 |
| Style | Tailwind CSS 4 |
| Animations | Framer Motion |
| Graphiques | Recharts |
| Icônes | Lucide React |
| Langues FR / EN | i18next + react-i18next |
| Qualité du code | oxlint |

## Lancer le projet

Prérequis : **Node.js 20.19 ou plus récent** (ou 22.12+) et npm.

### 1. Démarrer le backend de l'équipe

Le site lit ses données dans l'API FastAPI de l'équipe (`http://localhost:8000`, documentation Swagger sur `/docs`).
Il faut que le backend tourne et que la base soit alimentée (`just seed`, voir le dépôt backend).

### 2. Démarrer le frontend

Depuis la racine du dépôt :

```bash
cd frontends/frontend-Brina21694
npm install
npm run dev
```

Le site s'ouvre sur **http://localhost:5173**. En développement, Vite redirige les appels `/api/...` vers le backend
(proxy, donc pas de problème de CORS).

### Sans backend : mode d'exemple

Pour travailler sur l'interface sans backend, copier `.env.example` en `.env.local` et mettre `VITE_USE_MOCK=true`.
Le site utilise alors des données locales (`src/mocks/seed.ts`) qui ont exactement les mêmes formes que l'API.

### Variables d'environnement (fichier `.env.local`)

| Variable | Rôle | Valeur par défaut |
| --- | --- | --- |
| `VITE_API_PROXY` | Adresse du backend vers laquelle Vite redirige `/api` en développement | `http://localhost:8000` |
| `VITE_API_URL` | Adresse du backend appelée directement par le navigateur (ex. en production). Vide = même domaine | vide |
| `VITE_USE_MOCK` | `true` = données d'exemple, aucun appel réseau | `false` |

Autres commandes :

```bash
npm run build     # vérifie les types TypeScript et construit le site dans dist/
npm run preview   # sert le site construit (http://localhost:4173)
npm run lint      # analyse le code avec oxlint
```

### Le CV

Le bouton « Download CV » télécharge le fichier `public/CV-Brina-Achouke.pdf`.
Pour changer de CV, remplacer ce fichier en gardant le même nom.

## Routes de l'API consommées

Contrat : `API_ROUTES.md` de l'équipe. Toutes les routes passent par `src/services/api.ts` (types dans `src/types/api.ts`).
Le backend contient un seul candidat : aucune URL ne contient de slug de candidat.

| Route (GET) | Requête | Base | Utilisée par |
| --- | --- | --- | --- |
| `/api/profil` | R1 | MongoDB | Parcours (formations, expériences), Contact (courriel, LinkedIn), noms des compétences |
| `/api/projets?competence=&page=&size=` | R2 | MongoDB | Projets : liste, filtre par compétence, pagination |
| `/api/projets/{projet_slug}` | détail R2 | MongoDB | Projets : fenêtre de détail |
| `/api/experiences?lieu=` | R8 | MongoDB | Parcours : filtre par ville |
| `/api/stats/competences` | R3 | MongoDB | Compétences : liste, nombre de projets par compétence |
| `/api/stats/competences?limit=5` | R6 | MongoDB | Accueil : compétences phares |
| `/api/graph/projets/{projet_slug}/similaires` | R4 | Neo4j | Projets : bloc « Projets similaires » |
| `/api/graph/domaines/{domaine_slug}/competences` | R7 | Neo4j | Compétences : filtre par domaine |

Non utilisées par le site public : `/api/graph/competences` (R5, graphe : choix de ne pas l'afficher), `/api/health` et les routes d'écriture (`POST`/`DELETE`, écran Admin, clé `X-API-Key`).

Comportement en cas de problème :

- chaque bloc affiche « Chargement… », puis un message avec un bouton **Réessayer** si l'appel échoue ;
- les routes Neo4j (projets similaires, filtre par domaine) sont chargées **à part** : une panne Neo4j n'empêche pas d'afficher les projets ni les compétences ;
- l'accueil et le contact ont des valeurs de secours (compétences et courriel d'école) si l'API ne répond pas.

Limites connues du contrat :

- l'API renvoie **un seul texte (en français)**. En anglais, les libellés de l'interface sont traduits ; pour les trois projets, le titre et le résumé anglais viennent des traductions locales (`src/translations/`), sinon le texte de l'API est affiché tel quel ;
- le contenu détaillé des projets (contexte, méthode, résultats, images) n'existe pas dans l'API : il est rattaché au `projet_slug` dans `src/data/projectExtras.ts` ;
- le champ `niveau` des compétences existe dans l'API mais n'est **pas affiché** sur le site ;
- seules les compétences utilisées par au moins un projet apparaissent dans les statistiques (règle de R3) ; les autres compétences du profil sont listées à part, sans nombre de projets.

## Structure du code

```text
src/
├── components/     composants réutilisables (menu, fenêtre de détail, graphe, état de chargement, globe...)
│   ├── hero/       globe, particules, flux de données, graphiques flottants
│   └── datalab/    graphiques du Data Lab
├── sections/       une section de la page par fichier (Hero, About, Projects, DataLab...)
├── services/api.ts toutes les routes de l'API (+ version « mock »)
├── lib/            client HTTP (http.ts) et formatage des dates
├── types/api.ts    types TypeScript du contrat d'API
├── mocks/seed.ts   données d'exemple au format de l'API
├── data/           contenu local : À propos, Vision, Data Lab, contact (CV), contenu détaillé des projets
├── hooks/          hooks React (appel d'API, section active du menu...)
├── translations/   textes français (fr.ts) et anglais (en.ts)
├── utils/          fonctions de calcul (statistiques, nombres aléatoires à graine)
└── index.css       thème (couleurs, polices) et styles de base
```

## Données du Data Lab

- **Onglet « Résultats réels »** : résumés calculés à partir du jeu de données Kaggle *Job Salary Prediction* (250 000 profils, lui-même synthétique), ainsi que les résultats du notebook du projet. Le fichier complet n'est pas inclus dans le dépôt : seuls les agrégats le sont (`src/data/salaryStats.ts`).
- **Onglet « Démonstration interactive »** : données **fictives**, générées par le programme, et signalées comme telles sur chaque graphique.

## Accessibilité et performance

- Lien d'évitement « Aller au contenu », focus clavier visible, navigation complète au clavier.
- Les animations respectent la préférence système « réduire les animations ».
- Sections et graphiques décrits pour les lecteurs d'écran ; la matrice de corrélation est un vrai tableau HTML.
- Le Data Lab (bibliothèque de graphiques) est chargé séparément pour accélérer l'affichage de l'accueil.
- Le site est responsive (ordinateur, tablette, mobile).

## Travail en équipe

- Branche de travail : `feat/frontend-brina21694`.
- Ce dossier est le seul que Brina modifie pour son frontend.
