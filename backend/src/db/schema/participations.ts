import { pgTable, uuid, text, timestamp, index, pgEnum, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { events } from './events.js';

export const participationStatusEnum = pgEnum('participation_status', [
  'applied',
  'approved',
  'rejected',
  'confirmed',
  'withdrawn',
]);

export const participations = pgTable(
  'participations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: participationStatusEnum('status').notNull().default('applied'),
    rationale: text('rationale'),
    decidedById: uuid('decided_by_id').references(() => users.id),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.eventId, t.userId),
    index('idx_participations_event').on(t.eventId),
    index('idx_participations_user').on(t.userId),
  ],
);
