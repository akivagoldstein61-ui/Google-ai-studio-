import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { canViewAdminSurface } from '@/lib/roles';
import { isPrototypeDemoMode } from '@/lib/prototypeMode';

/**
 * Gates operator-only screens (`/admin/*`). Authenticated members who are not
 * admins are redirected to `/daily` — previously these screens were reachable
 * by any signed-in user (the surrounding `AuthGuard` only checks that a user
 * exists, not their role).
 *
 * Demo mode is allowed through on purpose: it is non-production, view-only, and
 * backed by local mock data, so no real operator or PII data is reachable there
 * and the prototype can still showcase the AI Ops / Experiments surfaces.
 *
 * Server routes and `firestore.rules` remain the authoritative boundary; this
 * is a UI-reachability guard, not a security boundary on its own.
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#F3EFEA] border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!canViewAdminSurface(user, isPrototypeDemoMode())) {
    return <Navigate to="/daily" replace />;
  }

  return <>{children}</>;
};
