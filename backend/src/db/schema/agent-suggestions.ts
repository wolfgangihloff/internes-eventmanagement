import { pgTable, uuid, text, timestamp, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';

export const suggestionStatusEnum = pgEnum('suggestion_status', [
  'pending',
  'accepted',
  'dismissed',
]);

export const agentSuggestions = pgTable(
  'agent_suggestions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'missing_task', 'missing_reminder', 'missing_field'
    title: text('title').notNull(),
    description: text('description'),
    actionData: jsonb('action_data'),
    status: suggestionStatusEnum('status').notNull().default('pending'),
    resolvedById: uuid('resolved_by_id').references(() => users.id),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_suggestions_event').on(t.eventId)],
);
