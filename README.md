# Word Rush — Jeu de Mots Multijoueur

Projet fil rouge — M2 INFO — Coordination Front & Back

---

## Concept

Word Rush est un jeu de mots en ligne inspiré du Scrabble et de Wordle. Les joueurs ont **90 secondes** pour former le maximum de mots valides à partir de **10 lettres communes**. Plus le mot est long, plus il rapporte de points.

- **Mode Solo** : s'entraîner contre la montre
- **Mode Multijoueur** : affronter 2 à 8 joueurs en temps réel via WebSocket

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Temps réel | Socket.io (WebSocket) |
| Backend | Node.js, Express |
| Base de données | PostgreSQL |
| Authentification | JWT (JSON Web Token) |
| Conteneurisation | Docker (PostgreSQL) |

---

## Architecture

```
client/                         server/
├── src/                        ├── src/
│   ├── pages/                  │   ├── routes/
│   │   ├── LoginPage           │   │   ├── auth.js
│   │   ├── RegisterPage        │   │   └── leaderboard.js
│   │   ├── ForgotPassword      │   ├── services/
│   │   ├── ResetPassword       │   │   ├── dictionaryService.js
│   │   ├── HomePage            │   │   └── roomManager.js
│   │   ├── GamePage            │   ├── socket/
│   │   └── LeaderboardPage     │   │   └── socketHandler.js
│   ├── components/             │   ├── middleware/
│   │   ├── Timer               │   │   └── auth.js
│   │   ├── LetterGrid          │   ├── config/
│   │   ├── WordInput           │   │   └── db.js
│   │   ├── ScoreBoard          │   └── data/
│   │   └── WordList            │       └── words.js
│   └── contexts/
│       ├── AuthContext
│       └── SocketContext
```

### Flux de communication

```
FRONTEND (React)  ←── WebSocket ──→  BACKEND (Node.js)
                  ←── REST API  ──→
                                           │
                                        SQL ↓
                                      PostgreSQL
                                           │
                                       HTTP ↓
                                  API Dictionnaire (FR)
```

- **REST** : authentification, classement
- **WebSocket** : toutes les actions en temps réel (lettres, mots, scores, timer)

---

## Lancer le projet

### Prérequis
- Node.js v18+
- Docker Desktop

### Installation

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd WordRush

# 2. Copier et remplir les variables d'environnement
cp server/.env.example .env
# Remplir DB_PASSWORD et JWT_SECRET dans .env

# 3. Lancer PostgreSQL avec Docker
docker-compose up -d

# 4. Lancer le serveur (terminal 1)
cd server && npm install && npm run dev

# 5. Lancer le client (terminal 2)
cd client && npm install && npm run dev
```

Ouvrir **http://localhost:5173**

---

## Base de données

Schéma PostgreSQL complet disponible dans [`docs/database/word_rush_mld.sql`](docs/database/word_rush_mld.sql).

| Table | Rôle |
|-------|------|
| `user_account` | Joueurs (auth, stats) |
| `game` | Parties (lettres, timer, statut) |
| `game_participation` | Liaison N:N User ↔ Game (scores, rang) |
| `word` | Mots soumis par partie et par joueur |
| `achievement` | Succès disponibles |
| `user_achievement` | Liaison N:N User ↔ Achievement |
| `dictionary` | Dictionnaire local français (fallback) |

---

## Fonctionnalités

- Inscription / Connexion sécurisée (bcrypt + JWT)
- Réinitialisation de mot de passe
- Génération aléatoire de lettres (distribution française pondérée)
- Validation des mots côté serveur (anti-triche)
- Système de cache pour l'API dictionnaire
- Synchronisation du timer côté serveur (équité entre joueurs)
- Rate limiting : 1 mot par seconde maximum par joueur
- Gestion des déconnexions en cours de partie
- Classement général persisté en base de données

---

## Sécurité

- Mots de passe hashés avec **bcrypt** (coût 10)
- Tokens JWT signés, expiration 7 jours
- Validation complète côté serveur (mots, lettres, timer)
- Requêtes SQL paramétrées (protection injection SQL)
- Authentification Socket.io via JWT middleware
- Variables sensibles dans `.env` (jamais commitées)

---

## Documentation

- [`docs/GUIDE_UTILISATION.md`](docs/GUIDE_UTILISATION.md) — Guide d'utilisation complet
- [`docs/database/word_rush_mld.sql`](docs/database/word_rush_mld.sql) — Schéma SQL
- [`docs/database/word_rush_mcd.dbml`](docs/database/word_rush_mcd.dbml) — Modèle conceptuel
- [`CLAUDE.md`](CLAUDE.md) — Architecture et conventions du projet
