/**
 * Script de données mock — Activité 3
 * Lance avec : node scripts/seed.js (depuis le dossier server/)
 * Mot de passe de tous les comptes de test : test1234
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seed() {
  console.log('Insertion des données de test...\n');

  // ── Utilisateurs ──────────────────────────────────────────────
  const hash = await bcrypt.hash('test1234', 10);

  const { rows: [alice] } = await pool.query(
    `INSERT INTO user_account (username, email, password_hash, best_score, total_games, total_wins)
     VALUES ('alice', 'alice@test.com', $1, 156, 12, 5)
     ON CONFLICT (email) DO NOTHING RETURNING id_user`,
    [hash]
  );
  const { rows: [bob] } = await pool.query(
    `INSERT INTO user_account (username, email, password_hash, best_score, total_games, total_wins)
     VALUES ('bob', 'bob@test.com', $1, 89, 8, 2)
     ON CONFLICT (email) DO NOTHING RETURNING id_user`,
    [hash]
  );
  const { rows: [charlie] } = await pool.query(
    `INSERT INTO user_account (username, email, password_hash, best_score, total_games, total_wins)
     VALUES ('charlie', 'charlie@test.com', $1, 210, 20, 9)
     ON CONFLICT (email) DO NOTHING RETURNING id_user`,
    [hash]
  );

  if (!alice || !bob || !charlie) {
    console.log('Les utilisateurs existent déjà, seed ignoré.');
    await pool.end();
    return;
  }

  const aliceId = alice.id_user;
  const bobId = bob.id_user;
  const charlieId = charlie.id_user;

  // ── Parties ───────────────────────────────────────────────────
  const { rows: [game1] } = await pool.query(
    `INSERT INTO game (letters, start_time, end_time, status)
     VALUES ('AEIRSNTLOC', NOW() - interval '2 days',
             NOW() - interval '2 days' + interval '90 seconds', 'finished')
     RETURNING id_game`
  );
  const { rows: [game2] } = await pool.query(
    `INSERT INTO game (letters, start_time, end_time, status)
     VALUES ('EAIUNRTMSD', NOW() - interval '1 day',
             NOW() - interval '1 day' + interval '90 seconds', 'finished')
     RETURNING id_game`
  );
  const { rows: [game3] } = await pool.query(
    `INSERT INTO game (letters, start_time, end_time, status)
     VALUES ('OEUAINTRSC', NOW() - interval '3 hours',
             NOW() - interval '3 hours' + interval '90 seconds', 'finished')
     RETURNING id_game`
  );

  const g1 = game1.id_game;
  const g2 = game2.id_game;
  const g3 = game3.id_game;

  // ── Participations (score + rang) ─────────────────────────────
  await pool.query(`INSERT INTO game_participation (id_user, id_game, score, rank) VALUES ($1,$2,156,1)`, [aliceId, g1]);
  await pool.query(`INSERT INTO game_participation (id_user, id_game, score, rank) VALUES ($1,$2, 89,2)`, [bobId,   g1]);
  await pool.query(`INSERT INTO game_participation (id_user, id_game, score, rank) VALUES ($1,$2,210,1)`, [charlieId,g2]);
  await pool.query(`INSERT INTO game_participation (id_user, id_game, score, rank) VALUES ($1,$2,120,2)`, [aliceId, g2]);
  await pool.query(`INSERT INTO game_participation (id_user, id_game, score, rank) VALUES ($1,$2, 75,1)`, [bobId,   g3]);

  // ── Mots soumis ───────────────────────────────────────────────
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'SOLEIL',25,true)`, [aliceId, g1]);
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'TOIT',   9,true)`, [aliceId, g1]);
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'ROI',    4,true)`, [aliceId, g1]);
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'NET',    4,true)`, [bobId,   g1]);
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'SUR',    4,true)`, [bobId,   g1]);
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'TRAIN', 16,true)`, [charlieId,g2]);
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'MARDI', 16,true)`, [charlieId,g2]);
  await pool.query(`INSERT INTO word (id_user,id_game,word,points,is_valid) VALUES ($1,$2,'RUE',    4,true)`, [bobId,   g3]);

  // ── Succès débloqués ──────────────────────────────────────────
  await pool.query(`INSERT INTO user_achievement (id_user,id_achievement) VALUES ($1,1)`, [aliceId]);
  await pool.query(`INSERT INTO user_achievement (id_user,id_achievement) VALUES ($1,1)`, [bobId]);
  await pool.query(`INSERT INTO user_achievement (id_user,id_achievement) VALUES ($1,1)`, [charlieId]);
  await pool.query(`INSERT INTO user_achievement (id_user,id_achievement) VALUES ($1,2)`, [charlieId]);

  // ── Dictionnaire local (quelques entrées) ─────────────────────
  const dictWords = ['SOLEIL','TOIT','ROI','NET','SUR','TRAIN','MARDI','RUE','CHAT','CHIEN'];
  for (const w of dictWords) {
    await pool.query(
      `INSERT INTO dictionary (word, length, language) VALUES ($1,$2,'fr') ON CONFLICT (word) DO NOTHING`,
      [w, w.length]
    );
  }

  console.log('Données insérées avec succès !\n');
  console.log('Comptes de test (mot de passe : test1234)');
  console.log('  alice@test.com');
  console.log('  bob@test.com');
  console.log('  charlie@test.com');

  await pool.end();
}

seed().catch(err => {
  console.error('Erreur seed :', err.message);
  process.exit(1);
});
