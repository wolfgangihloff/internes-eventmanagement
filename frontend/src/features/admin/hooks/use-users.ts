import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { User, Role } from '@/types/user';

interface UserWithDetails extends User {
  isActive: boolean;
  createdAt: string;
}

interface CreateUserInput {
  email: string;
  displayName: string;
  password: string;
  roles: Role[];
}

export function useUsers(search?: string) {
  return useQuery({
    queryKey: ['users', search],
    queryFn: () =>
      apiClient
        .get<UserWithDetails[]>('/users', { params: search ? { search } : undefined })
        .then((r) => r.data),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      apiClient.post<UserWithDetails>('/users', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; displayName?: string; isActive?: boolean }) =>
      apiClient.patch<UserWithDetails>(`/users/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useSetUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
      apiClient.put<UserWithDetails>(`/users/${id}/roles`, { roles }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
