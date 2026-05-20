import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-extrabold tracking-tight">Word Rush</h1>
        <div className="flex items-center gap-5">
          <span className="text-sm text-gray-500">
            Bonjour, <span className="font-semibold text-black">{user?.username}</span>
          </span>
          <button
            onClick={() => navigate('/leaderboard')}
            className="text-sm font-medium hover:underline"
          >
            Classement
          </button>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-black transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4">Jouer</h2>
          <p className="text-gray-500 text-lg">
            Formez le maximum de mots en <strong>90 secondes</strong> avec 10 lettres communes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={() => navigate('/game?mode=solo')}
            className="group border-2 border-black rounded-2xl p-8 text-left hover:bg-black hover:text-white transition-all duration-150"
          >
            <div className="text-3xl mb-3">Solo</div>
            <p className="text-sm text-gray-500 group-hover:text-gray-300 transition">
              Entraînez-vous contre la montre, sans adversaire.
            </p>
          </button>

          <button
            onClick={() => navigate('/game?mode=multi')}
            className="group border-2 border-black rounded-2xl p-8 text-left hover:bg-black hover:text-white transition-all duration-150"
          >
            <div className="text-3xl mb-3">Multijoueur</div>
            <p className="text-sm text-gray-500 group-hover:text-gray-300 transition">
              Affrontez jusqu'à 8 joueurs en temps réel.
            </p>
          </button>
        </div>

        <div className="mt-10 text-center text-xs text-gray-400">
          Score : (longueur − 1)² points par mot — mot de 5 lettres = 16 pts, 7 lettres = 36 pts
        </div>
      </main>
    </div>
  );
}
