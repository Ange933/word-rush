const { verifySocketToken } = require('../middleware/auth');
const { validateWord, generateLetters, normalize, GAME_DURATION } = require('../services/dictionaryService');
const {
  createRoom, addPlayer, findAvailableMultiRoom,
  getPlayerRoom, removePlayer, getScores, getPlayersInfo, saveGameResults,
} = require('../services/roomManager');

const RATE_LIMIT_MS = 800;

function startGame(io, room) {
  room.status = 'playing';
  room.letters = generateLetters();
  room.startTime = new Date();

  io.to(room.id).emit('game_start', {
    letters: room.letters,
    duration: GAME_DURATION,
    startTime: room.startTime.getTime(),
  });

  room.timer = setTimeout(async () => {
    room.status = 'finished';
    const scores = getScores(room);
    const results = scores.map((s, i) => ({
      ...s,
      rank: i + 1,
      words: room.players.get(s.socketId)?.words || [],
    }));
    io.to(room.id).emit('game_end', { results });
    await saveGameResults(room);
  }, GAME_DURATION * 1000);
}

module.exports = function setupSocket(io) {
  // Authentification JWT à la connexion
  io.use((socket, next) => {
    const user = verifySocketToken(socket.handshake.auth?.token);
    if (!user) return next(new Error('Unauthorized'));
    socket.user = user;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.user.username} (${socket.id})`);

    socket.on('join_solo', () => {
      if (getPlayerRoom(socket.id)) return;
      const room = createRoom('solo');
      addPlayer(room, socket.id, socket.user);
      socket.join(room.id);

      socket.emit('room_joined', {
        roomId: room.id,
        players: getPlayersInfo(room),
        isHost: true,
        status: room.status,
      });

      // Démarrage différé de 3 secondes (compte à rebours côté client)
      setTimeout(() => {
        if (room.status === 'waiting') startGame(io, room);
      }, 3000);
    });

    socket.on('join_multi', () => {
      if (getPlayerRoom(socket.id)) return;
      let room = findAvailableMultiRoom() || createRoom('multi');
      addPlayer(room, socket.id, socket.user);
      socket.join(room.id);

      socket.emit('room_joined', {
        roomId: room.id,
        players: getPlayersInfo(room),
        isHost: room.hostId === socket.id,
        status: room.status,
      });

      socket.to(room.id).emit('player_joined', {
        username: socket.user.username,
        players: getPlayersInfo(room),
      });
    });

    socket.on('start_game', () => {
      const room = getPlayerRoom(socket.id);
      if (!room || room.hostId !== socket.id || room.status !== 'waiting') return;
      if (room.players.size < 2) {
        return socket.emit('error', { message: 'Il faut au moins 2 joueurs pour commencer' });
      }
      startGame(io, room);
    });

    socket.on('submit_word', async ({ word } = {}) => {
      const room = getPlayerRoom(socket.id);
      if (!room || room.status !== 'playing') return;

      const player = room.players.get(socket.id);
      if (!player) return;

      // Rate limiting
      const now = Date.now();
      if (now - player.lastSubmit < RATE_LIMIT_MS) {
        return socket.emit('word_result', { word, valid: false, reason: 'Trop vite !' });
      }
      player.lastSubmit = now;

      // Vérification du timer côté serveur
      const elapsed = (now - room.startTime.getTime()) / 1000;
      if (elapsed >= GAME_DURATION) {
        return socket.emit('word_result', { word, valid: false, reason: 'Temps écoulé' });
      }

      const normalized = normalize(word || '');

      // Doublon
      if (player.words.includes(normalized)) {
        return socket.emit('word_result', { word: normalized, valid: false, reason: 'Mot déjà utilisé' });
      }

      const result = await validateWord(normalized, room.letters);

      if (result.valid) {
        player.score += result.points;
        player.words.push(normalized);

        socket.emit('word_result', {
          word: normalized,
          valid: true,
          points: result.points,
          totalScore: player.score,
        });
        io.to(room.id).emit('score_update', { scores: getScores(room) });
      } else {
        socket.emit('word_result', { word: normalized, valid: false, reason: result.reason });
      }
    });

    socket.on('leave_room', () => {
      const room = removePlayer(socket.id);
      if (room) {
        socket.leave(room.id);
        io.to(room.id).emit('player_left', {
          username: socket.user.username,
          players: getPlayersInfo(room),
        });
      }
    });

    socket.on('disconnect', () => {
      const room = removePlayer(socket.id);
      if (room) {
        io.to(room.id).emit('player_left', {
          username: socket.user.username,
          players: getPlayersInfo(room),
        });
      }
      console.log(`[socket] disconnected: ${socket.user.username}`);
    });
  });
};
