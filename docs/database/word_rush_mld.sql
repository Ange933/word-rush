-- Word Rush — Modèle logique de données (PostgreSQL)
-- Reconstruit à partir de l'usage réel du code serveur (server/src, server/scripts/seed.js)

-- ═══════════════════════════════════════════════════════════════
-- user_account
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_account (
  id_user       SERIAL PRIMARY KEY,
  username      VARCHAR(20) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  best_score    INTEGER NOT NULL DEFAULT 0,
  total_games   INTEGER NOT NULL DEFAULT 0,
  total_wins    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- game
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE game (
  id_game    SERIAL PRIMARY KEY,
  letters    VARCHAR(10) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time   TIMESTAMP,
  status     VARCHAR(10) NOT NULL DEFAULT 'waiting'
             CHECK (status IN ('waiting', 'playing', 'finished'))
);

-- ═══════════════════════════════════════════════════════════════
-- game_participation (liaison N:N user_account ↔ game)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE game_participation (
  id_user  INTEGER NOT NULL REFERENCES user_account(id_user) ON DELETE CASCADE,
  id_game  INTEGER NOT NULL REFERENCES game(id_game) ON DELETE CASCADE,
  score    INTEGER NOT NULL DEFAULT 0,
  rank     INTEGER,
  PRIMARY KEY (id_user, id_game)
);

-- ═══════════════════════════════════════════════════════════════
-- word (mots soumis par partie et par joueur)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE word (
  id_word   SERIAL PRIMARY KEY,
  id_user   INTEGER NOT NULL REFERENCES user_account(id_user) ON DELETE CASCADE,
  id_game   INTEGER NOT NULL REFERENCES game(id_game) ON DELETE CASCADE,
  word      VARCHAR(20) NOT NULL,
  points    INTEGER NOT NULL DEFAULT 0,
  is_valid  BOOLEAN NOT NULL DEFAULT TRUE,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- achievement
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE achievement (
  id_achievement SERIAL PRIMARY KEY,
  name           VARCHAR(50) NOT NULL,
  description    VARCHAR(255)
);

-- ═══════════════════════════════════════════════════════════════
-- user_achievement (liaison N:N user_account ↔ achievement)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_achievement (
  id_user        INTEGER NOT NULL REFERENCES user_account(id_user) ON DELETE CASCADE,
  id_achievement INTEGER NOT NULL REFERENCES achievement(id_achievement) ON DELETE CASCADE,
  unlocked_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_user, id_achievement)
);

-- ═══════════════════════════════════════════════════════════════
-- dictionary (dictionnaire local FR de fallback)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE dictionary (
  word     VARCHAR(20) PRIMARY KEY,
  length   INTEGER NOT NULL,
  language VARCHAR(5) NOT NULL DEFAULT 'fr'
);

-- ═══════════════════════════════════════════════════════════════
-- Index critiques
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_game_status         ON game(status);
CREATE INDEX idx_participation_user  ON game_participation(id_user);
CREATE INDEX idx_participation_game  ON game_participation(id_game);
CREATE INDEX idx_dictionary_word     ON dictionary(word);

-- ═══════════════════════════════════════════════════════════════
-- Données de référence minimales (requises par server/scripts/seed.js)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO achievement (id_achievement, name, description) VALUES
  (1, 'Premier mot',   'Soumettre son premier mot valide'),
  (2, 'Champion',      'Terminer 1er d''une partie multijoueur');
