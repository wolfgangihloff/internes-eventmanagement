import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoginPage } from '@/features/auth/login-page';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { EventFeedPage } from '@/features/events/event-feed-page';
import { EventDetailPage } from '@/features/events/event-detail-page';
import { EventCreatePage } from '@/features/events/event-create-page';
import { AdminUsersPage } from '@/features/admin/admin-users-page';
import { RoleGuard } from '@/components/layout/role-guard';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/events', element: <EventFeedPage /> },
      { path: '/events/new', element: <EventCreatePage /> },
      { path: '/events/:eventId', element: <EventDetailPage /> },
      {
        element: <RoleGuard roles={['event_admin']} />,
        children: [{ path: '/admin', element: <AdminUsersPage /> }],
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
