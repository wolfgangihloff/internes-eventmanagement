import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    action: text('action').notNull(),
    actorId: uuid('actor_id').references(() => users.id),
    actorType: text('actor_type').notNull().default('user'),
    changes: jsonb('changes'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_audit_entity').on(t.entityType, t.entityId),
    index('idx_audit_actor').on(t.actorId),
    index('idx_audit_time').on(t.createdAt),
  ],
);
