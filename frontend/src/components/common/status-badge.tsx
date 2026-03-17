import { Badge } from '@/components/ui/badge';
import type { EventStatus } from '@/types/event';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  draft: { label: 'Entwurf', className: 'bg-status-draft text-white' },
  proposed: { label: 'Vorgeschlagen', className: 'bg-status-proposed text-white' },
  approved: { label: 'Genehmigt', className: 'bg-status-approved text-white' },
  planned: { label: 'Geplant', className: 'bg-status-planned text-white' },
  executed: { label: 'Durchgeführt', className: 'bg-status-executed text-white' },
  cancelled: { label: 'Abgesagt', className: 'bg-status-cancelled text-white' },
};

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={cn(config.className, 'border-none', className)}>
      {config.label}
    </Badge>
  );
}
