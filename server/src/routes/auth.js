const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { signToken, verifyToken } = require('../middleware/auth');

// Tokens de réinitialisation en mémoire (expire après 1h)
const resetTokens = new Map();

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe trop court (6 caractères min)' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Nom d\'utilisateur : 3 à 20 caractères' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO user_account (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id_user, username, email',
      [username.trim(), email.toLowerCase().trim(), hash]
    );
    const user = result.rows[0];
    const token = signToken({ userId: user.id_user, username: user.username });
    res.status(201).json({ token, user: { id: user.id_user, username: user.username, email: user.email } });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  try {
    const result = await pool.query(
      'SELECT id_user, username, email, password_hash FROM user_account WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    const token = signToken({ userId: user.id_user, username: user.username });
    res.json({ token, user: { id: user.id_user, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_user, username, email, best_score, total_games, total_wins FROM user_account WHERE id_user = $1',
      [req.user.userId]
    );
    const u = result.rows[0];
    if (!u) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ id: u.id_user, username: u.username, email: u.email, bestScore: u.best_score, totalGames: u.total_games, totalWins: u.total_wins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const result = await pool.query(
      'SELECT id_user FROM user_account WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    // Réponse identique même si l'email n'existe pas (sécurité anti-énumération)
    if (!result.rows[0]) {
      return res.json({ message: 'Si cet email existe, un lien a été envoyé.' });
    }
    const userId = result.rows[0].id_user;
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { userId, expires: Date.now() + 3600_000 });

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    console.log(`\n[RESET PASSWORD] ${email} → ${resetUrl}\n`);

    res.json({ message: 'Lien généré.', resetUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token et mot de passe requis' });
  if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court' });

  const entry = resetTokens.get(token);
  if (!entry || entry.expires < Date.now()) {
    return res.status(400).json({ error: 'Lien invalide ou expiré' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE user_account SET password_hash = $1 WHERE id_user = $2', [hash, entry.userId]);
    resetTokens.delete(token);
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
