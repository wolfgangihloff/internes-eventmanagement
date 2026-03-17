import { Link } from 'react-router-dom';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import type { Event } from '@/types/event';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={event.status} />
                {event.industry && (
                  <span className="text-xs text-muted-foreground">{event.industry}</span>
                )}
              </div>
              <h3 className="font-semibold leading-tight">{event.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {event.startsAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(event.startsAt), 'd. MMM yyyy', { locale: de })}
                    {event.endsAt && (
                      <> - {format(new Date(event.endsAt), 'd. MMM yyyy', { locale: de })}</>
                    )}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </span>
                )}
                {event.organizer && (
                  <span className="flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {event.organizer}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
