import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  LayoutDashboard,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/auth-store';
import { hasPermission } from '@/lib/role-utils';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/events', label: 'Events', icon: CalendarDays },
  { path: '/admin', label: 'Verwaltung', icon: Settings, permission: 'admin:access' as const },
];

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return user && hasPermission(user.roles, item.permission);
  });

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold text-primary">ECS</span>
        <span className="ml-1 text-lg font-light text-muted-foreground">Events</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t p-3">
        <div className="mb-2 px-3 text-sm">
          <div className="font-medium text-foreground">{user?.displayName}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </aside>
  );
}
