import type { ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/auth-store';
import { hasPermission, type Permission } from '@/lib/role-utils';

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const user = useAuthStore((s) => s.user);
  if (!user || !hasPermission(user.roles, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
