export type ParticipationStatus = 'applied' | 'approved' | 'rejected' | 'confirmed' | 'withdrawn';

export interface Participation {
  id: string;
  eventId: string;
  userId: string;
  status: ParticipationStatus;
  rationale?: string | null;
  decidedById?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
