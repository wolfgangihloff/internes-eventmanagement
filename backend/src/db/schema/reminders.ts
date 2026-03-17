import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';
import { tasks } from './tasks';

export const reminderTriggerTypeEnum = pgEnum('reminder_trigger_type', [
  'time_based',
  'condition_based',
]);

export const reminders = pgTable(
  'reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    message: text('message'),
    triggerType: reminderTriggerTypeEnum('trigger_type').notNull().default('time_based'),
    triggerAt: timestamp('trigger_at', { withTimezone: true }),
    relativeDueDays: text('relative_due_days'), // e.g. "-3" days
    anchorField: text('anchor_field'), // which event/task date to offset from
    conditionExpr: jsonb('condition_expr'),
    recipientIds: uuid('recipient_ids').array(),
    isSent: boolean('is_sent').notNull().default(false),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdById: uuid('created_by_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_reminders_trigger').on(t.triggerAt)],
);
