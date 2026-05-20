const { generateLetters, GAME_DURATION } = require('./dictionaryService');
const pool = require('../config/db');

const rooms = new Map();       // roomId → room
const playerRooms = new Map(); // socketId → roomId

let counter = 0;

function createRoom(type) {
  const id = `room_${++counter}`;
  const room = {
    id,
    type,
    status: 'waiting',
    letters: [],
    players: new Map(), // socketId → { userId, username, score, words, lastSubmit }
    hostId: null,
    startTime: null,
    timer: null,
  };
  rooms.set(id, room);
  return room;
}

function addPlayer(room, socketId, user) {
  if (room.players.size === 0) room.hostId = socketId;
  room.players.set(socketId, {
    userId: user.userId,
    username: user.username,
    score: 0,
    words: [],
    lastSubmit: 0,
  });
  playerRooms.set(socketId, room.id);
}

function findAvailableMultiRoom() {
  for (const room of rooms.values()) {
    if (room.type === 'multi' && room.status === 'waiting' && room.players.size < 8) {
      return room;
    }
  }
  return null;
}

function getPlayerRoom(socketId) {
  const id = playerRooms.get(socketId);
  return id ? rooms.get(id) : null;
}

function removePlayer(socketId) {
  const room = getPlayerRoom(socketId);
  if (!room) return null;

  room.players.delete(socketId);
  playerRooms.delete(socketId);

  if (room.hostId === socketId && room.players.size > 0) {
    room.hostId = room.players.keys().next().value;
  }

  if (room.players.size === 0) {
    if (room.timer) clearTimeout(room.timer);
    rooms.delete(room.id);
    return null;
  }

  return room;
}

function getScores(room) {
  return Array.from(room.players.entries())
    .map(([socketId, p]) => ({
      socketId,
      username: p.username,
      score: p.score,
      wordCount: p.words.length,
    }))
    .sort((a, b) => b.score - a.score);
}

function getPlayersInfo(room) {
  return Array.from(room.players.values()).map(p => ({
    username: p.username,
    score: p.score,
  }));
}

async function saveGameResults(room) {
  try {
    const scores = getScores(room);
    const gameRes = await pool.query(
      `INSERT INTO game (letters, start_time, end_time, status)
       VALUES ($1, $2, NOW(), 'finished') RETURNING id_game`,
      [room.letters.join(''), room.startTime]
    );
    const gameId = gameRes.rows[0].id_game;

    for (let i = 0; i < scores.length; i++) {
      const s = scores[i];
      const player = room.players.get(s.socketId);
      await pool.query(
        `INSERT INTO game_participation (id_user, id_game, score, rank) VALUES ($1, $2, $3, $4)`,
        [player.userId, gameId, s.score, i + 1]
      );
      await pool.query(
        `UPDATE user_account
         SET total_games = total_games + 1,
             total_wins  = total_wins + $1,
             best_score  = GREATEST(best_score, $2)
         WHERE id_user = $3`,
        [i === 0 ? 1 : 0, s.score, player.userId]
      );
    }
  } catch (err) {
    console.error('Erreur sauvegarde résultats:', err.message);
  }
}

module.exports = {
  createRoom, addPlayer, findAvailableMultiRoom,
  getPlayerRoom, removePlayer, getScores, getPlayersInfo, saveGameResults,
};
