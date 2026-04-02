import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export function RequireAuth() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (!isConfigured) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-xl animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
          }}
        />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth();

  if (!isConfigured) {
    return <>{children}</>;
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-xl animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
          }}
        />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
