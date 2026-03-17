import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth-store';
import { useEvents } from '@/features/events/hooks/use-events';
import { useMyParticipations } from '@/features/participations/hooks/use-participations';
import { EventCard } from '@/features/events/components/event-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { CalendarDays, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const PARTICIPATION_LABELS: Record<string, string> = {
  applied: 'Beworben',
  approved: 'Genehmigt',
  confirmed: 'Bestätigt',
  rejected: 'Abgelehnt',
  withdrawn: 'Zurückgezogen',
};

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useEvents({ upcoming: true, pageSize: 50 });
  const { data: myParticipations, isLoading: loadingParticipations } = useMyParticipations();

  const events = data?.items ?? [];
  const activeParticipations = myParticipations?.filter(
    (p) => p.event && !['rejected', 'withdrawn'].includes(p.status),
  ) ?? [];

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hallo, {user?.displayName}</h1>
        <Button variant="outline" asChild>
          <Link to="/events">
            Alle Events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* My events */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserCheck className="h-4 w-4" />
          <h2 className="text-sm font-medium">
            Meine Events ({activeParticipations.length})
          </h2>
        </div>

        {loadingParticipations ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : activeParticipations.length > 0 ? (
          <div className="space-y-2">
            {activeParticipations.map((p) => (
              <Link key={p.id} to={`/events/${p.eventId}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={p.event!.status} />
                        <span className="font-medium">{p.event!.title}</span>
                      </div>
                      {p.event!.startsAt && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(p.event!.startsAt), 'd. MMM yyyy', { locale: de })}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">{PARTICIPATION_LABELS[p.status] ?? p.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Du nimmst noch an keinen Events teil.
          </p>
        )}
      </div>

      {/* Upcoming events */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <h2 className="text-sm font-medium">
            Veranstaltungen der nächsten 90 Tage & ohne Datum ({events.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Keine anstehenden Veranstaltungen in den nächsten 90 Tagen.
          </p>
        )}
      </div>
    </div>
  );
}
