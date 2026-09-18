import React from 'react';

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-900">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-600">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const Input = React.forwardRef(({ className = '', error, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-600/50 focus:border-ink-500 focus:ring-1 focus:ring-ink-500 transition-colors ${
      error ? 'border-red-300' : 'border-paper-200'
    } ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className = '', error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-600/50 focus:border-ink-500 focus:ring-1 focus:ring-ink-500 transition-colors resize-y ${
      error ? 'border-red-300' : 'border-paper-200'
    } ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-ink-500 focus:ring-1 focus:ring-ink-500 transition-colors ${className}`}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
