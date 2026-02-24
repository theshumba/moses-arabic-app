const RATINGS = [
  {
    rating: 1,
    label: 'Again',
    key: '1',
    colorClasses:
      'bg-again/20 text-again border border-again/30 hover:bg-again/30',
  },
  {
    rating: 2,
    label: 'Hard',
    key: '2',
    colorClasses:
      'bg-hard/20 text-hard border border-hard/30 hover:bg-hard/30',
  },
  {
    rating: 3,
    label: 'Good',
    key: '3',
    colorClasses:
      'bg-good/20 text-good border border-good/30 hover:bg-good/30',
  },
  {
    rating: 4,
    label: 'Easy',
    key: '4',
    colorClasses:
      'bg-easy/20 text-easy border border-easy/30 hover:bg-easy/30',
  },
];

export default function RatingButtons({ onRate, disabled = false }) {
  return (
    <div className="flex gap-3 justify-center">
      {RATINGS.map(({ rating, label, key, colorClasses }) => (
        <button
          type="button"
          key={rating}
          onClick={() => onRate(rating)}
          disabled={disabled}
          className={`px-6 py-3 rounded-xl font-medium text-base transition-colors ${colorClasses} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div>{label}</div>
          <div className="text-xs opacity-60 mt-0.5">{key}</div>
        </button>
      ))}
    </div>
  );
}
