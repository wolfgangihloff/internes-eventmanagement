import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Can } from '@/components/common/can';
import { EventCard } from './components/event-card';
import { useEvents } from './hooks/use-events';
import type { EventStatus } from '@/types/event';

const STATUS_OPTIONS: { value: EventStatus | ''; label: string }[] = [
  { value: '', label: 'Alle Status' },
  { value: 'draft', label: 'Entwurf' },
  { value: 'proposed', label: 'Vorgeschlagen' },
  { value: 'approved', label: 'Genehmigt' },
  { value: 'planned', label: 'Geplant' },
  { value: 'executed', label: 'Durchgeführt' },
];

export function EventFeedPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');

  const { data, isLoading } = useEvents({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Can permission="event:create">
          <Button asChild>
            <Link to="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Neues Event
            </Link>
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | '')}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Event List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Keine Events gefunden.
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
