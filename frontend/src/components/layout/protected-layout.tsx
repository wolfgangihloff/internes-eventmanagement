import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth-store';
import { AppShell } from './app-shell';

export function ProtectedLayout() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}
