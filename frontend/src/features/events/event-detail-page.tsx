import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { Can } from '@/components/common/can';
import { useEvent, useTransitionEvent } from './hooks/use-events';
import { ParticipationList } from '@/features/participations/components/participation-list';
import { TaskList } from '@/features/tasks/components/task-list';
import type { EventStatus } from '@/types/event';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useState } from 'react';

const TABS = [
  { id: 'info', label: 'Info' },
  { id: 'participants', label: 'Teilnehmer' },
  { id: 'tasks', label: 'Aufgaben' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Entwurf',
  proposed: 'Vorgeschlagen',
  approved: 'Genehmigt',
  planned: 'Geplant',
  executed: 'Durchgeführt',
  cancelled: 'Abgesagt',
};

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId!);
  const transitionMutation = useTransitionEvent();
  const [activeTab, setActiveTab] = useState<TabId>('info');

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!event) {
    return <div className="py-12 text-center text-muted-foreground">Event nicht gefunden.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/events"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <StatusBadge status={event.status} />
            </div>
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
            </div>
          </div>

          {/* Transition buttons */}
          <Can permission="event:edit">
            <div className="flex gap-2">
              {event.availableTransitions?.map((to) => (
                <Button
                  key={to}
                  size="sm"
                  variant={to === 'cancelled' ? 'destructive' : 'outline'}
                  onClick={() => transitionMutation.mutate({ id: event.id, to })}
                  disabled={transitionMutation.isPending}
                >
                  {STATUS_LABELS[to]}
                </Button>
              ))}
            </div>
          </Can>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {event.description || 'Keine Beschreibung vorhanden.'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {event.organizer && (
                <div>
                  <span className="text-muted-foreground">Veranstalter:</span> {event.organizer}
                </div>
              )}
              {event.industry && (
                <div>
                  <span className="text-muted-foreground">Branche:</span> {event.industry}
                </div>
              )}
              {event.venue && (
                <div>
                  <span className="text-muted-foreground">Ort:</span> {event.venue}
                </div>
              )}
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Externe Seite
                </a>
              )}
              {event.notes && (
                <div>
                  <span className="text-muted-foreground">Notizen:</span> {event.notes}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'participants' && <ParticipationList eventId={event.id} />}
      {activeTab === 'tasks' && <TaskList eventId={event.id} />}
    </div>
  );
}
