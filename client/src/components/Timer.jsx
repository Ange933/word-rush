import { useState, useEffect } from 'react';

export default function Timer({ startTime, duration }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRemaining(Math.max(0, Math.ceil(duration - elapsed)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [startTime, duration]);

  const pct = remaining / duration;
  const color = pct > 0.5 ? 'text-black' : pct > 0.2 ? 'text-orange-500' : 'text-red-600';

  return (
    <div className={`tabular-nums font-extrabold text-4xl ${color} transition-colors`}>
      {remaining}
      <span className="text-base font-medium ml-1 opacity-60">s</span>
    </div>
  );
}
