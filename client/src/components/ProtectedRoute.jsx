import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-ink-600">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
