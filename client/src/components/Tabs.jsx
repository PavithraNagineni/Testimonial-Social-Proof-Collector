import React from 'react';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-paper-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            active === tab.value ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-ink-600/70">({tab.count})</span>
          )}
          {active === tab.value && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-ink-900 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
