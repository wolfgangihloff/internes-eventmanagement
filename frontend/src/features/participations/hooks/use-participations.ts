import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Participation } from '@/types/participation';
import type { Event } from '@/types/event';

interface ParticipationWithEvent extends Participation {
  event: Event | null;
}

export function useMyParticipations() {
  return useQuery({
    queryKey: ['my-participations'],
    queryFn: () =>
      apiClient.get<ParticipationWithEvent[]>('/users/me/participations').then((r) => r.data),
  });
}

export function useParticipations(eventId: string) {
  return useQuery({
    queryKey: ['participations', eventId],
    queryFn: () =>
      apiClient.get<Participation[]>(`/events/${eventId}/participations`).then((r) => r.data),
    enabled: !!eventId,
  });
}

export function useApplyParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, rationale }: { eventId: string; rationale?: string }) =>
      apiClient.post(`/events/${eventId}/participations`, { rationale }).then((r) => r.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['participations', vars.eventId] });
    },
  });
}

export function useDecideParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      participationId,
      decision,
    }: {
      eventId: string;
      participationId: string;
      decision: 'approved' | 'rejected';
    }) =>
      apiClient
        .patch(`/events/${eventId}/participations/${participationId}`, { decision })
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['participations', vars.eventId] });
    },
  });
}
