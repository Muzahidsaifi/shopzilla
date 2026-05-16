import { Star } from 'lucide-react';

export default function StarRating({ rating, numReviews, size = 14, showCount = true }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-[var(--text-muted)]">
          {rating?.toFixed(1)} {numReviews !== undefined && `(${numReviews})`}
        </span>
      )}
    </div>
  );
}

export function InteractiveStarRating({ value, onChange, size = 24 }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)} className="transition-transform hover:scale-110">
          <Star size={size} className={i <= value ? 'star-filled' : 'star-empty'} />
        </button>
      ))}
    </div>
  );
}
