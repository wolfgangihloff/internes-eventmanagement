import { pgTable, uuid, text, jsonb, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'employee' | 'manager' | 'event_admin' | 'marketing'
    scope: jsonb('scope'), // optional: { teamId: "..." } for scoped manager roles
  },
  (t) => [unique().on(t.userId, t.role)],
);
