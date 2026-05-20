# Word Rush — Guide d'utilisation

## Présentation

Word Rush est un jeu de mots multijoueur en ligne. Les joueurs ont **90 secondes** pour former le maximum de mots valides à partir de **10 lettres communes**. Plus un mot est long, plus il rapporte de points.

---

## 1. Prérequis et lancement

### Ce qu'il faut avoir installé
- Node.js (v18 ou supérieur)
- Docker Desktop (pour la base de données PostgreSQL)

### Étapes de démarrage

**1. Lancer la base de données (Docker)**
```bash
# À la racine du projet WordRush/
docker-compose up -d
```

**2. Lancer le serveur** (dans un terminal)
```bash
cd server
npm install
npm run dev
```
→ Vous devez voir : `Server running on port 3001`

**3. Lancer le client** (dans un second terminal)
```bash
cd client
npm install
npm run dev
```
→ Vous devez voir : `Local: http://localhost:5173/`

**4. Ouvrir le navigateur**
```
http://localhost:5173
```

---

## 2. Créer un compte

1. Sur la page d'accueil, cliquez sur **"S'inscrire"**
2. Remplissez les champs :
   - **Nom d'utilisateur** : entre 3 et 20 caractères
   - **Email** : une adresse email valide
   - **Mot de passe** : minimum 6 caractères
3. Cliquez sur **"Créer mon compte"**
4. Vous êtes automatiquement connecté et redirigé vers l'accueil

---

## 3. Se connecter

1. Sur la page de connexion, entrez votre **email** et **mot de passe**
2. Cliquez sur **"Se connecter"**

---

## 4. Mot de passe oublié

1. Sur la page de connexion, cliquez sur **"Mot de passe oublié ?"**
2. Entrez votre **adresse email**
3. Cliquez sur **"Envoyer le lien"**
4. Un bouton **"Réinitialiser mon mot de passe"** apparaît directement à l'écran
5. Cliquez dessus → entrez et confirmez votre nouveau mot de passe
6. Cliquez sur **"Mettre à jour"**
7. Vous êtes redirigé vers la connexion avec le nouveau mot de passe

> **Note :** Pour ce projet, le lien est affiché directement à l'écran (pas d'email envoyé). En production, un email serait envoyé automatiquement.

---

## 5. Jouer en mode Solo

1. Sur l'accueil, cliquez sur la carte **"Solo"**
2. Un compte à rebours de 3 secondes apparaît
3. **10 lettres** s'affichent à l'écran
4. Tapez un mot dans le champ de saisie et appuyez sur **Entrée** ou cliquez **"OK"**
   - Vous pouvez aussi **cliquer sur les tuiles** pour composer le mot lettre par lettre
5. Si le mot est valide : les points s'affichent en vert (`+X pts`)
6. Si le mot est invalide : la raison s'affiche en rouge (mot inconnu, lettres non disponibles, déjà utilisé…)
7. À la fin des 90 secondes, l'écran de résultats affiche votre score et vos mots

### Règles de validation
- Le mot doit contenir **au minimum 2 lettres**
- Chaque lettre utilisée doit être **disponible dans les 10 lettres tirées**
- Le mot doit exister dans le **dictionnaire français**
- Un même mot **ne peut pas être soumis deux fois**

### Calcul des points
| Longueur du mot | Points |
|-----------------|--------|
| 2 lettres | 1 pt |
| 3 lettres | 4 pts |
| 4 lettres | 9 pts |
| 5 lettres | 16 pts |
| 6 lettres | 25 pts |
| 7 lettres | 36 pts |

*Formule : (longueur − 1)²*

---

## 6. Jouer en mode Multijoueur

### Rejoindre une partie

1. Sur l'accueil, cliquez sur **"Multijoueur"**
2. Vous rejoignez automatiquement une salle disponible (ou une nouvelle salle est créée)
3. La salle affiche la liste des joueurs connectés

### Lancer la partie

- Le **premier joueur** à rejoindre est l'**hôte**
- L'hôte voit le bouton **"Lancer la partie"** (activé dès que 2 joueurs sont présents)
- Les autres joueurs voient : *"En attente du lancement par l'hôte..."*
- L'hôte clique sur **"Lancer la partie"** → la partie démarre pour tous simultanément

### Pendant la partie

- Tous les joueurs reçoivent **les mêmes 10 lettres**
- Le **timer est synchronisé** sur le serveur (équitable pour tous)
- Un tableau de scores en direct s'affiche à droite
- Les scores se mettent à jour en temps réel à chaque mot validé

### Fin de partie

- Le serveur annonce le gagnant automatiquement à la fin des 90 secondes
- L'écran de résultats affiche le classement final avec scores et nombre de mots
- Bouton **"Rejouer"** pour relancer une partie dans le même mode
- Bouton **"Accueil"** pour revenir au menu

> **Pour tester le multijoueur en local :** ouvrez deux navigateurs différents (ex. Chrome + Firefox) ou Chrome + Chrome en navigation privée (`Ctrl+Shift+N`), et créez un compte sur chacun.

---

## 7. Classement

1. Sur l'accueil, cliquez sur **"Classement"**
2. Le tableau affiche le **Top 20** des joueurs par meilleur score
3. Votre position personnelle s'affiche en haut du tableau
4. Colonnes : rang, joueur, meilleur score, victoires, parties jouées

---

## 8. Se déconnecter

Cliquez sur **"Déconnexion"** en haut à droite de l'accueil.

---

## Récapitulatif des pages

| URL | Page |
|-----|------|
| `/login` | Connexion |
| `/register` | Inscription |
| `/forgot-password` | Mot de passe oublié |
| `/reset-password` | Réinitialisation du mot de passe |
| `/` | Accueil — choix du mode de jeu |
| `/game?mode=solo` | Partie solo |
| `/game?mode=multi` | Partie multijoueur |
| `/leaderboard` | Classement général |

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Temps réel | Socket.io |
| Backend | Node.js, Express |
| Base de données | PostgreSQL (via Docker) |
| Authentification | JWT (JSON Web Token) |
