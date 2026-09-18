import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <div className="text-4xl mb-3">🧭</div>
      <h1 className="font-display text-2xl text-ink-900 mb-2">Page not found</h1>
      <p className="text-sm text-ink-600 mb-5">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
