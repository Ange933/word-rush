export default function ScoreBoard({ scores }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Scores en direct
      </h3>
      {scores.length === 0 ? (
        <p className="text-gray-300 text-sm">—</p>
      ) : (
        <ul className="space-y-2">
          {scores.map((s, i) => (
            <li key={s.username} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <span className={`text-sm font-medium ${i === 0 ? 'text-black' : 'text-gray-600'}`}>
                  {s.username}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-bold">{s.score}</span>
                <span className="text-gray-400 text-xs ml-1">pts</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
