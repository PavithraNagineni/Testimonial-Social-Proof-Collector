import React from 'react';

const variants = {
  pending: 'bg-clay-400/15 text-clay-600 border-clay-400/30',
  approved: 'bg-ink-500/10 text-ink-700 border-ink-500/25',
  archived: 'bg-paper-200 text-ink-600 border-paper-200',
  featured: 'bg-ink-900 text-paper-50 border-ink-900',
  neutral: 'bg-paper-100 text-ink-700 border-paper-200',
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
