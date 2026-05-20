import { useEffect, useRef } from 'react';

export default function WordInput({ word, onWordChange, onSubmit, lastResult }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    onWordChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const isValid = lastResult?.valid === true;
  const isInvalid = lastResult?.valid === false;

  return (
    <div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={word}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="TAPEZ UN MOT"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className={`flex-1 border-2 rounded-xl px-4 py-3 text-xl font-bold text-center tracking-widest
                      transition-colors focus:outline-none
                      ${isValid ? 'border-green-500 bg-green-50' : ''}
                      ${isInvalid ? 'border-red-400 bg-red-50' : ''}
                      ${!lastResult ? 'border-black' : ''}`}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!word}
          className="bg-black text-white rounded-xl px-6 py-3 font-semibold
                     hover:bg-gray-800 disabled:opacity-30 transition active:scale-95"
        >
          OK
        </button>
      </div>

      <div className="h-6 mt-1.5 text-center text-sm font-medium">
        {lastResult && (
          <span className={lastResult.valid ? 'text-green-600' : 'text-red-500'}>
            {lastResult.valid
              ? `+${lastResult.points} pts — ${lastResult.word}`
              : lastResult.reason}
          </span>
        )}
      </div>
    </div>
  );
}
