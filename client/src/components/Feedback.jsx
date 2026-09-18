import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-paper-200 rounded-md ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="border border-paper-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2.5 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

export function EmptyState({ icon = '💬', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-display text-lg text-ink-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-600 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
