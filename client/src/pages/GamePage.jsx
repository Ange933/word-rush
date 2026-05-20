import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Timer from '../components/Timer';
import LetterGrid from '../components/LetterGrid';
import WordInput from '../components/WordInput';
import ScoreBoard from '../components/ScoreBoard';
import WordList from '../components/WordList';

const PHASE = { LOBBY: 'lobby', COUNTDOWN: 'countdown', PLAYING: 'playing', ENDED: 'ended' };

export default function GamePage() {
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'multi' ? 'multi' : 'solo';
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [phase, setPhase] = useState(PHASE.LOBBY);
  const [letters, setLetters] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [myWords, setMyWords] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [scores, setScores] = useState([]);
  const [results, setResults] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [gameInfo, setGameInfo] = useState({ startTime: null, duration: 90 });
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef(null);
  const resultTimerRef = useRef(null);

  const showResult = useCallback((result) => {
    setLastResult(result);
    clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => setLastResult(null), 2000);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onRoomJoined = ({ roomId, players, isHost, status }) => {
      setRoomId(roomId);
      setPlayers(players);
      setIsHost(isHost);
      if (status === 'playing') setPhase(PHASE.PLAYING);
    };

    const onPlayerJoined = ({ players }) => setPlayers(players);
    const onPlayerLeft = ({ players }) => setPlayers(players);

    const onGameStart = ({ letters, duration, startTime }) => {
      setLetters(letters);
      setGameInfo({ startTime, duration });
      setPhase(PHASE.COUNTDOWN);
      let count = 3;
      setCountdown(count);
      clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownRef.current);
          setPhase(PHASE.PLAYING);
        }
      }, 1000);
    };

    const onWordResult = (result) => {
      showResult(result);
      if (result.valid) {
        setMyScore(result.totalScore);
        setMyWords(prev => [{ word: result.word, points: result.points }, ...prev]);
      }
    };

    const onScoreUpdate = ({ scores }) => setScores(scores);

    const onGameEnd = ({ results }) => {
      clearInterval(countdownRef.current);
      setResults(results);
      setPhase(PHASE.ENDED);
    };

    const onError = ({ message }) => showResult({ valid: false, reason: message });

    socket.on('room_joined', onRoomJoined);
    socket.on('player_joined', onPlayerJoined);
    socket.on('player_left', onPlayerLeft);
    socket.on('game_start', onGameStart);
    socket.on('word_result', onWordResult);
    socket.on('score_update', onScoreUpdate);
    socket.on('game_end', onGameEnd);
    socket.on('error', onError);

    if (mode === 'solo') {
      socket.emit('join_solo');
    } else {
      socket.emit('join_multi');
    }

    return () => {
      socket.off('room_joined', onRoomJoined);
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_left', onPlayerLeft);
      socket.off('game_start', onGameStart);
      socket.off('word_result', onWordResult);
      socket.off('score_update', onScoreUpdate);
      socket.off('game_end', onGameEnd);
      socket.off('error', onError);
      socket.emit('leave_room');
      clearInterval(countdownRef.current);
      clearTimeout(resultTimerRef.current);
    };
  }, [socket, mode, showResult]);

  const submitWord = useCallback(() => {
    const w = currentWord.trim();
    if (!w || !socket || phase !== PHASE.PLAYING) return;
    socket.emit('submit_word', { word: w });
    setCurrentWord('');
  }, [socket, phase, currentWord]);

  // ---- LOBBY ----
  if (phase === PHASE.LOBBY) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-2">
            {mode === 'solo' ? 'Mode Solo' : 'Salon multijoueur'}
          </h2>
          {roomId && (
            <p className="text-center text-xs text-gray-400 mb-8">
              Salle #{roomId.split('_')[1]}
            </p>
          )}

          {mode === 'multi' && (
            <div className="border border-gray-200 rounded-xl p-5 mb-6">
              <p className="text-sm font-medium text-gray-500 mb-3">
                Joueurs ({players.length} / 8)
              </p>
              <ul className="space-y-2">
                {players.map(p => (
                  <li key={p.username} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    {p.username}
                    {isHost && players[0]?.username === p.username && (
                      <span className="text-xs text-gray-400">(hôte)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mode === 'solo' && (
            <p className="text-center text-gray-400 text-sm mb-6">
              Démarrage automatique dans 3 secondes...
            </p>
          )}

          {mode === 'multi' && isHost && (
            <button
              onClick={() => socket?.emit('start_game')}
              disabled={players.length < 2}
              className="w-full bg-black text-white rounded-xl py-3 font-semibold disabled:opacity-40 hover:bg-gray-800 transition mb-3"
            >
              {players.length < 2
                ? `En attente d'un 2e joueur (${players.length}/2)`
                : 'Lancer la partie'}
            </button>
          )}

          {mode === 'multi' && !isHost && (
            <p className="text-center text-gray-400 text-sm mb-3">
              En attente du lancement par l'hôte...
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full text-sm text-gray-400 hover:text-black transition py-2"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  // ---- COUNTDOWN ----
  if (phase === PHASE.COUNTDOWN) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest">Prêt ?</p>
        <div className="text-9xl font-extrabold tabular-nums">{countdown || 'GO'}</div>
      </div>
    );
  }

  // ---- ENDED ----
  if (phase === PHASE.ENDED) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center mb-8">Résultats</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            {results?.map((r, i) => (
              <div
                key={r.username}
                className={`flex items-center justify-between px-6 py-4 ${
                  i === 0 ? 'bg-black text-white' : 'border-t border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-6">{i + 1}</span>
                  <span className="font-semibold">{r.username}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{r.score} pts</p>
                  <p className={`text-xs ${i === 0 ? 'text-gray-400' : 'text-gray-400'}`}>
                    {r.words.length} mot{r.words.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/game?mode=${mode}`)}
              className="flex-1 bg-black text-white rounded-xl py-3 font-semibold hover:bg-gray-800 transition"
            >
              Rejouer
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 border border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50 transition"
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* En-tête : timer + score */}
        <div className="flex items-center justify-between mb-8">
          <Timer startTime={gameInfo.startTime} duration={gameInfo.duration} />
          <div className="text-right">
            <p className="text-3xl font-extrabold">{myScore}</p>
            <p className="text-xs text-gray-400">points</p>
          </div>
        </div>

        {/* Lettres */}
        <LetterGrid
          letters={letters}
          onLetterClick={(l) => setCurrentWord(w => w + l)}
        />

        {/* Saisie */}
        <div className="my-6">
          <WordInput
            word={currentWord}
            onWordChange={setCurrentWord}
            onSubmit={submitWord}
            lastResult={lastResult}
          />
        </div>

        {/* Mots + scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <WordList words={myWords} />
          {mode === 'multi' && <ScoreBoard scores={scores} />}
        </div>
      </div>
    </div>
  );
}
