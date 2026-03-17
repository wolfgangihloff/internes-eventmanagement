import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Event, EventFilters } from '@/types/event';
import type { PaginatedResponse } from '@/types/api';

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Event>>('/events', { params: filters })
        .then((r) => r.data),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => apiClient.get<Event>(`/events/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Event>) =>
      apiClient.post<Event>('/events', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Event> & { id: string }) =>
      apiClient.patch<Event>(`/events/${id}`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', vars.id] });
    },
  });
}

export function useTransitionEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) =>
      apiClient.post<Event>(`/events/${id}/transition`, { to }).then((r) => r.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', vars.id] });
    },
  });
}
