export type Role = 'employee' | 'manager' | 'event_admin' | 'marketing';

export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: Role[];
}
