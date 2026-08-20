import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 font-serif text-historia-blue text-xl">Vérification des accès...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin) {
    // Dans ce projet, admin et editeur ont accès au pannel admin
    const hasAccess = profile?.role === 'admin' || profile?.role === 'editeur';
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
