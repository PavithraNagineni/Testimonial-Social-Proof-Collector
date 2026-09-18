import React from 'react';

const variants = {
  primary: 'bg-ink-900 text-paper-50 hover:bg-ink-800 border-transparent',
  secondary: 'bg-white text-ink-900 border-paper-200 hover:bg-paper-100',
  ghost: 'bg-transparent text-ink-900 border-transparent hover:bg-paper-100',
  danger: 'bg-white text-red-700 border-red-200 hover:bg-red-50',
  clay: 'bg-clay-500 text-white border-transparent hover:bg-clay-600',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2.5 rounded-lg',
  lg: 'text-base px-5 py-3 rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
