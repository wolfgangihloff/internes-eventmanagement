export type EventStatus = 'draft' | 'proposed' | 'approved' | 'planned' | 'executed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  externalUrl?: string | null;
  organizer?: string | null;
  industry?: string | null;
  location?: string | null;
  venue?: string | null;
  status: EventStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  bookingOpensAt?: string | null;
  bookingClosesAt?: string | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  availableTransitions?: EventStatus[];
}

export interface EventFilters {
  status?: EventStatus;
  industry?: string;
  search?: string;
  upcoming?: boolean;
  page?: number;
  pageSize?: number;
}
