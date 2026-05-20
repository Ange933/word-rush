const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT username, best_score, total_wins, total_games
       FROM user_account
       ORDER BY best_score DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT username, best_score, total_wins, total_games,
              (SELECT COUNT(*) + 1 FROM user_account WHERE best_score > u.best_score)::int AS rank
       FROM user_account u WHERE id_user = $1`,
      [req.user.userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
