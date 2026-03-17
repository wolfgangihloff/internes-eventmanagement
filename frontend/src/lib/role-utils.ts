export const PERMISSIONS = {
  'event:create': ['marketing', 'event_admin'],
  'event:edit': ['marketing', 'event_admin'],
  'event:delete': ['event_admin'],
  'event:propose': ['employee', 'manager', 'marketing', 'event_admin'],
  'participation:apply': ['employee', 'manager'],
  'participation:approve': ['manager', 'event_admin'],
  'task:create': ['event_admin', 'manager'],
  'task:complete': ['employee', 'manager', 'event_admin'],
  'reminder:create': ['event_admin', 'manager'],
  'admin:access': ['event_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(roles: string[], permission: Permission): boolean {
  return PERMISSIONS[permission]?.some((r) => roles.includes(r)) ?? false;
}
