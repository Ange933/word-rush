export default function WordList({ words }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Mes mots ({words.length})
      </h3>
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {words.length === 0 ? (
          <p className="text-gray-300 text-sm">Aucun mot encore...</p>
        ) : (
          words.map((w, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="font-semibold">{w.word}</span>
              <span className="text-green-600 font-bold">+{w.points}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
