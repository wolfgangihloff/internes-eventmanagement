import type { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '../domain/errors.js';

export const PERMISSIONS = {
  'event:create': ['marketing', 'event_admin'],
  'event:propose': ['employee', 'manager', 'marketing', 'event_admin'],
  'event:read': ['employee', 'manager', 'event_admin', 'marketing'],
  'event:update': ['event_admin', 'marketing'],
  'event:delete': ['event_admin'],
  'event:transition': ['event_admin', 'manager'],

  'participation:apply': ['employee', 'manager'],
  'participation:decide': ['manager', 'event_admin'],
  'participation:read': ['employee', 'manager', 'event_admin'],

  'task:create': ['event_admin', 'manager'],
  'task:assign': ['event_admin', 'manager'],
  'task:complete': ['employee', 'manager', 'event_admin'],
  'task:read': ['employee', 'manager', 'event_admin'],

  'template:manage': ['event_admin'],

  'reminder:manage': ['event_admin', 'manager'],
  'reminder:read': ['employee', 'manager', 'event_admin'],

  'calendar:manage': ['event_admin', 'manager'],
  'calendar:read': ['employee', 'manager', 'event_admin'],

  'communication:send': ['event_admin', 'manager'],
  'communication:read': ['employee', 'manager', 'event_admin'],

  'audit:read': ['event_admin'],

  'agent:suggestions': ['event_admin', 'manager'],

  'user:manage': ['event_admin'],
  'team:manage': ['event_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type EventCreationStatus = 'draft' | 'proposed';

export function hasPermission(userRoles: readonly string[], permission: Permission) {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.some((role) => userRoles.includes(role));
}

export function canCreateEventWithStatus(
  userRoles: readonly string[],
  status: EventCreationStatus,
) {
  if (status === 'draft') {
    return hasPermission(userRoles, 'event:create');
  }

  return (
    hasPermission(userRoles, 'event:create') ||
    hasPermission(userRoles, 'event:propose')
  );
}

export function resolveEventCreationStatus(
  userRoles: readonly string[],
  requestedStatus?: EventCreationStatus,
): EventCreationStatus {
  if (requestedStatus) {
    if (!canCreateEventWithStatus(userRoles, requestedStatus)) {
      throw new ForbiddenError('Keine Berechtigung für diese Aktion');
    }
    return requestedStatus;
  }

  if (hasPermission(userRoles, 'event:create')) {
    return 'draft';
  }

  if (hasPermission(userRoles, 'event:propose')) {
    return 'proposed';
  }

  throw new ForbiddenError('Keine Berechtigung für diese Aktion');
}

export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userRoles = request.user.roles;
    if (!hasPermission(userRoles, permission)) {
      throw new ForbiddenError('Keine Berechtigung für diese Aktion');
    }
  };
}
