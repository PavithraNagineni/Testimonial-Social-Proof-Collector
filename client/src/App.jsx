import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SpaceSettings from './pages/SpaceSettings';
import ModerationInbox from './pages/ModerationInbox';
import CollectForm from './pages/CollectForm';
import WallOfLove from './pages/WallOfLove';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public collection form and wall pages render without the app nav bar for a clean, embeddable feel */}
      <Route path="/collect/:slug" element={<CollectForm />} />
      <Route path="/wall/:slug" element={<WallOfLove />} />

      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spaces/:id/settings"
                  element={
                    <ProtectedRoute>
                      <SpaceSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spaces/:id/inbox"
                  element={
                    <ProtectedRoute>
                      <ModerationInbox />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
}
