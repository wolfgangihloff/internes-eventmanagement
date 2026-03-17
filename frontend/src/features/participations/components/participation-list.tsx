import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Can } from '@/components/common/can';
import { useAuthStore } from '@/features/auth/auth-store';
import {
  useParticipations,
  useApplyParticipation,
  useDecideParticipation,
} from '../hooks/use-participations';
import type { ParticipationStatus } from '@/types/participation';
import { Check, X, UserPlus } from 'lucide-react';

const STATUS_CONFIG: Record<ParticipationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  applied: { label: 'Beworben', variant: 'outline' },
  approved: { label: 'Genehmigt', variant: 'default' },
  rejected: { label: 'Abgelehnt', variant: 'destructive' },
  confirmed: { label: 'Bestätigt', variant: 'default' },
  withdrawn: { label: 'Zurückgezogen', variant: 'secondary' },
};

interface ParticipationListProps {
  eventId: string;
}

export function ParticipationList({ eventId }: ParticipationListProps) {
  const user = useAuthStore((s) => s.user);
  const { data: participations, isLoading } = useParticipations(eventId);
  const applyMutation = useApplyParticipation();
  const decideMutation = useDecideParticipation();

  const hasApplied = participations?.some((p) => p.userId === user?.id);

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Teilnehmer ({participations?.length ?? 0})</CardTitle>
        <Can permission="participation:apply">
          {!hasApplied && (
            <Button
              size="sm"
              onClick={() => applyMutation.mutate({ eventId })}
              disabled={applyMutation.isPending}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Bewerben
            </Button>
          )}
        </Can>
      </CardHeader>
      <CardContent>
        {participations?.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Teilnehmer.</p>
        ) : (
          <div className="space-y-2">
            {participations?.map((p) => {
              const config = STATUS_CONFIG[p.status];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{p.userId}</span>
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {p.rationale && (
                      <span className="text-xs text-muted-foreground">"{p.rationale}"</span>
                    )}
                  </div>
                  <Can permission="participation:approve">
                    {p.status === 'applied' && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          onClick={() =>
                            decideMutation.mutate({
                              eventId,
                              participationId: p.id,
                              decision: 'approved',
                            })
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() =>
                            decideMutation.mutate({
                              eventId,
                              participationId: p.id,
                              decision: 'rejected',
                            })
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Can>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
