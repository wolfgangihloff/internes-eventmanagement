import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth-store';
import type { Role } from '@/types/user';

interface RoleGuardProps {
  roles: Role[];
}

export function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.some((r) => user.roles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
