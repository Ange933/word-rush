import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/leaderboard'),
      api.get('/leaderboard/me').catch(() => ({ data: null })),
    ]).then(([res, meRes]) => {
      setPlayers(res.data);
      setMyStats(meRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const medals = ['', ''];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-black transition mb-8 flex items-center gap-1"
        >
          ← Retour
        </button>

        <h2 className="text-3xl font-extrabold mb-2">Classement</h2>
        <p className="text-gray-500 text-sm mb-8">Top 20 joueurs par meilleur score</p>

        {myStats && (
          <div className="border border-gray-200 rounded-xl px-6 py-4 mb-6 bg-gray-50 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Votre position</p>
              <p className="font-bold text-lg">#{myStats.rank} — {myStats.username}</p>
            </div>
            <div className="text-right text-sm text-gray-600 space-y-0.5">
              <p>Meilleur score : <strong>{myStats.best_score}</strong></p>
              <p>Victoires : <strong>{myStats.total_wins}</strong> / {myStats.total_games} parties</p>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-10">Chargement...</p>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joueur</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Meilleur score</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Victoires</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Parties</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr
                    key={p.username}
                    className={`border-t border-gray-100 ${i === 0 ? 'bg-yellow-50' : i === 1 ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-400">
                      {medals[i] || i + 1}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-sm">{p.username}</td>
                    <td className="px-5 py-3.5 text-right font-bold">{p.best_score}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-600">{p.total_wins}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-400">{p.total_games}</td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      Aucun joueur pour l'instant
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
