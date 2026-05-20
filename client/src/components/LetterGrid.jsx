export default function LetterGrid({ letters, onLetterClick }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {letters.map((letter, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onLetterClick(letter)}
          className="w-13 h-13 w-12 h-12 bg-black text-white rounded-xl font-bold text-xl
                     hover:bg-gray-700 active:scale-95 transition-all duration-75 select-none"
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
