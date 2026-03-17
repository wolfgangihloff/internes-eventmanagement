import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Task } from '@/types/task';

export function useTasks(eventId: string) {
  return useQuery({
    queryKey: ['tasks', eventId],
    queryFn: () =>
      apiClient.get<Task[]>(`/events/${eventId}/tasks`).then((r) => r.data),
    enabled: !!eventId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, ...data }: { eventId: string; title: string; dueAt?: string; assigneeId?: string }) =>
      apiClient.post<Task>(`/events/${eventId}/tasks`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', vars.eventId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      taskId,
      ...data
    }: {
      eventId: string;
      taskId: string;
      status?: string;
      title?: string;
    }) =>
      apiClient.patch<Task>(`/events/${eventId}/tasks/${taskId}`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', vars.eventId] });
    },
  });
}
