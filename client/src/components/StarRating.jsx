import React from 'react';

export function StarRatingInput({ value, onChange, size = 28 }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={n <= value ? '#d18a3a' : 'none'}
            stroke={n <= value ? '#d18a3a' : '#c9c1ac'}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function StarRatingDisplay({ value, size = 16 }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rated ${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={n <= value ? '#d18a3a' : 'none'}
          stroke={n <= value ? '#d18a3a' : '#c9c1ac'}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
