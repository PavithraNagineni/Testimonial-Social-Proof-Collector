import React from 'react';

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-paper-200 rounded-xl shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
