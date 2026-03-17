import { InvalidTransitionError, ForbiddenError } from './errors.js';

export type EventStatus = 'draft' | 'proposed' | 'approved' | 'planned' | 'executed' | 'cancelled';

interface Actor {
  id: string;
  roles: string[];
}

interface TransitionRule {
  from: EventStatus;
  to: EventStatus;
  allowedRoles: string[];
}

const TRANSITIONS: TransitionRule[] = [
  { from: 'draft', to: 'proposed', allowedRoles: ['employee', 'marketing', 'event_admin'] },
  { from: 'proposed', to: 'approved', allowedRoles: ['event_admin', 'manager'] },
  { from: 'approved', to: 'planned', allowedRoles: ['event_admin'] },
  { from: 'planned', to: 'executed', allowedRoles: ['event_admin'] },
  // Cancellation from any non-terminal state
  { from: 'draft', to: 'cancelled', allowedRoles: ['event_admin', 'marketing'] },
  { from: 'proposed', to: 'cancelled', allowedRoles: ['event_admin', 'manager'] },
  { from: 'approved', to: 'cancelled', allowedRoles: ['event_admin'] },
  { from: 'planned', to: 'cancelled', allowedRoles: ['event_admin'] },
];

export function validateTransition(
  currentStatus: EventStatus,
  targetStatus: EventStatus,
  actor: Actor,
): void {
  const rule = TRANSITIONS.find((t) => t.from === currentStatus && t.to === targetStatus);

  if (!rule) {
    throw new InvalidTransitionError(
      `Ungültiger Übergang von "${currentStatus}" nach "${targetStatus}"`,
    );
  }

  if (!rule.allowedRoles.some((r) => actor.roles.includes(r))) {
    throw new ForbiddenError(
      `Keine Berechtigung für den Übergang von "${currentStatus}" nach "${targetStatus}"`,
    );
  }
}

export function getAvailableTransitions(
  currentStatus: EventStatus,
  actorRoles: string[],
): EventStatus[] {
  return TRANSITIONS.filter(
    (t) => t.from === currentStatus && t.allowedRoles.some((r) => actorRoles.includes(r)),
  ).map((t) => t.to);
}
