# infonews.day — Backend Node.js

Agrégateur de news automatisé : BBC RSS + Le Monde RSS + NewsAPI.
Projet : `hachi-art/infonews-v1`

---

## Installation

### Prérequis
- Node.js >= 18 (`node --version`)
- npm >= 9
- Une clé API NewsAPI gratuite : https://newsapi.org/register

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/hachi-art/infonews-v1.git
cd infonews-v1/site

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et renseigner NEWS_API_KEY

# 4. Démarrer le serveur
npm start
```

Le serveur tourne sur `http://localhost:3000`.

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `NEWS_API_KEY` | Oui | Clé API NewsAPI (https://newsapi.org) |
| `PORT` | Non | Port Express (défaut : 3000) |
| `NODE_ENV` | Non | `development` ou `production` |
| `BASE_URL` | Non | URL publique du site |

Le fichier `.env` ne doit JAMAIS être commité. Il est dans `.gitignore`.

---

## Routes API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Interface web (index.html) |
| GET | `/health` | Health check JSON |
| GET | `/api/news` | Toutes les sources fusionnées |
| GET | `/api/news/bbc` | Uniquement BBC RSS |
| GET | `/api/news/lemonde` | Uniquement Le Monde RSS |
| GET | `/api/news/newsapi` | Uniquement NewsAPI (params : `q`, `lang`, `pageSize`) |

### Exemple de réponse `/api/news`

```json
{
  "total": 45,
  "fetchedAt": "2026-03-31T10:00:00.000Z",
  "articles": [
    {
      "id": "https://bbc.co.uk/news/...",
      "title": "Titre de l'article",
      "summary": "Résumé court...",
      "url": "https://...",
      "source": "BBC",
      "publishedAt": "2026-03-31T09:30:00.000Z",
      "imageUrl": "https://...",
      "lang": "en"
    }
  ]
}
```

---

## Mode développement (rechargement automatique)

```bash
npm run dev
# Utilise nodemon — rechargement à chaque modification
```

---

## Déploiement rapide

### Option A — Render (recommandé, gratuit)

1. Créer un compte sur https://render.com
2. New Web Service → connecter `hachi-art/infonews-v1`
3. Build command : `npm install`
4. Start command : `node server.js`
5. Ajouter la variable `NEWS_API_KEY` dans Environment
6. Deploy → Render donne une URL `*.onrender.com`
7. Pointer le domaine `infonews.day` vers cette URL (voir `domaine/DNS_CONFIG.md`)

### Option B — Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set NEWS_API_KEY=ta_cle_ici
```

### Option C — Vercel (limitations)

Vercel est pensé pour du serverless. Pour un serveur Express persistant,
préférer Render ou Railway. Si tu utilises Vercel, ajouter un `vercel.json` :

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

---

## Structure du projet

```
site/
├── server.js              # Point d'entrée Express
├── package.json
├── .env.example           # Template variables d'environnement
├── .gitignore
├── routes/
│   └── news.js            # Définition des routes /api/news
├── controllers/
│   └── newsController.js  # Logique métier, agrégation, déduplication
├── services/
│   ├── bbcRss.js          # Fetch + parse RSS BBC
│   ├── lemondeRss.js      # Fetch + parse RSS Le Monde
│   └── newsApi.js         # Appel REST NewsAPI
└── public/
    └── index.html         # Interface web front-end
```

---

*Sébastien Marquetoux — hachi-art/infonews-v1*
