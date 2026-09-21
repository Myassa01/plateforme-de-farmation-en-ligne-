# LearnHub

Plateforme de formation en ligne  — projet Full Stack avec React/TypeScript côté client et FastAPI/PostgreSQL côté serveur.

> **Statut** : Phase 3 terminée — backend (auth, users) et frontend (routing, auth, dashboards par rôle) fonctionnels et connectés. Le catalogue de cours, le lecteur de cours, les quiz, certificats, etc. arrivent en Phase 4.

## Fonctionnalités (prévues à terme)

- Authentification JWT (access + refresh token), rôles Student / Instructor / Admin
- Catalogue de formations avec recherche, filtres, pagination et tri
- Création de formations par les instructeurs, workflow de validation admin
- Lecteur de cours (vidéo, sections, lessons, ressources PDF)
- Suivi de progression par étudiant
- Quiz (QCM, Vrai/Faux) avec calcul de score
- Certificats PDF téléchargeables
- Wishlist, avis et notes
- Notifications
- Dashboards Student / Instructor / Admin

## Architecture

```
.
├── backend/     # API FastAPI (routers → services → repositories → models)
├── frontend/    # SPA React + TypeScript + Vite (à venir en Phase 3)
└── docker-compose.yml
```

Voir le détail de l'architecture backend et frontend dans les sections ci-dessous.

## Technologies

| Côté | Stack |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Zustand, React Hook Form, Zod |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic, JWT, PostgreSQL |
| Infra | Docker, Docker Compose, Redis (à venir) |
| Tests | Pytest (backend), Vitest/Testing Library (frontend, à venir) |

## Installation

### Prérequis
- Python 3.10+
- PostgreSQL 16+ (local ou via Docker)
- Node.js 20+ (pour le frontend, Phase 3)
- Docker + Docker Compose (optionnel, pour un lancement tout-en-un)

### Backend — installation locale (sans Docker)

```bash
cd backend
python -m venv venv
./venv/Scripts/activate        # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

cp .env.example .env
# Éditer .env : renseigner DATABASE_URL et JWT_SECRET_KEY

# Créer la base PostgreSQL (adapter selon votre installation)
# CREATE USER learnhub WITH PASSWORD 'learnhub';
# CREATE DATABASE learnhub OWNER learnhub;

alembic upgrade head

python -m app.utils.seed        # crée les comptes de démonstration

uvicorn app.main:app --reload
```

L'API est disponible sur `http://localhost:8000`, la documentation Swagger sur `http://localhost:8000/docs`.

### Frontend — installation locale (sans Docker)

```bash
cd frontend
npm install

cp .env.example .env
# Éditer .env si l'API ne tourne pas sur http://localhost:8000

npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Lancement avec Docker

```bash
docker compose up --build
```

Cela démarre PostgreSQL, le backend et le frontend en une seule commande.

## Configuration `.env`

Voir [backend/.env.example](backend/.env.example) pour la liste complète des variables :

- `DATABASE_URL` — chaîne de connexion PostgreSQL
- `JWT_SECRET_KEY` — clé secrète pour signer les tokens (générer une valeur aléatoire, ne jamais commiter la vraie valeur)
- `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` — durées de vie des tokens
- `CORS_ORIGINS` — origines autorisées (liste séparée par des virgules)
- `STORAGE_DIR` — dossier de stockage local des fichiers uploadés

## Structure du projet

```
backend/
├── app/
│   ├── core/            # config, sécurité (hash, JWT)
│   ├── database/         # session SQLAlchemy, base declarative, types custom
│   ├── models/            # modèles ORM
│   ├── schemas/            # schémas Pydantic (entrée/sortie API)
│   ├── repositories/        # accès DB pur
│   ├── services/              # logique métier
│   ├── routers/                 # endpoints FastAPI
│   ├── dependencies/              # get_current_user, require_role
│   ├── exceptions/                  # exceptions métier custom
│   └── main.py
├── alembic/               # migrations de base de données
└── tests/
    ├── unit/
    └── integration/
```

## Endpoints principaux

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Se connecter (retourne access + refresh token) |
| POST | `/auth/refresh` | Rafraîchir l'access token |
| GET | `/auth/me` | Profil de l'utilisateur connecté |
| PATCH | `/users/me` | Modifier son profil |

La liste complète et interactive est disponible sur `/docs` une fois le serveur lancé.


## Tests

```bash
cd backend
pytest
```

