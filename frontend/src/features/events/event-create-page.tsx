import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateEvent } from './hooks/use-events';
import { useState } from 'react';

export function EventCreatePage() {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  const [form, setForm] = useState({
    title: '',
    description: '',
    externalUrl: '',
    organizer: '',
    industry: '',
    location: '',
    startsAt: '',
    endsAt: '',
    status: 'draft' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent.mutate(
      {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      },
      {
        onSuccess: (event) => navigate(`/events/${event.id}`),
      },
    );
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Neues Event erstellen</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="organizer">Veranstalter</Label>
                <Input
                  id="organizer"
                  value={form.organizer}
                  onChange={(e) => update('organizer', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Branche</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => update('industry', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Startdatum</Label>
                <Input
                  id="startsAt"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => update('startsAt', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endsAt">Enddatum</Label>
                <Input
                  id="endsAt"
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => update('endsAt', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="externalUrl">Externer Link</Label>
              <Input
                id="externalUrl"
                type="url"
                value={form.externalUrl}
                onChange={(e) => update('externalUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Wird erstellt...' : 'Event erstellen'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
