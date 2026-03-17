export type ParticipationStatus = 'applied' | 'approved' | 'rejected' | 'confirmed' | 'withdrawn';

export interface Participation {
  id: string;
  eventId: string;
  userId: string;
  userEmail?: string | null;
  userDisplayName?: string | null;
  status: ParticipationStatus;
  rationale?: string | null;
  decidedById?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
