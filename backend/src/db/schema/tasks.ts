import { pgTable, uuid, text, timestamp, integer, index, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { events } from './events.js';
import { checklistTemplateItems } from './checklist-templates.js';

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'skipped',
]);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: taskStatusEnum('status').notNull().default('pending'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    assigneeId: uuid('assignee_id').references(() => users.id),
    createdById: uuid('created_by_id').references(() => users.id),
    templateItemId: uuid('template_item_id').references(() => checklistTemplateItems.id),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_tasks_event').on(t.eventId),
    index('idx_tasks_assignee').on(t.assigneeId),
    index('idx_tasks_due').on(t.dueAt),
  ],
);
