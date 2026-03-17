import { pgTable, uuid, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const checklistTemplates = pgTable('checklist_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const checklistTemplateItems = pgTable('checklist_template_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id')
    .notNull()
    .references(() => checklistTemplates.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  relativeDueDays: integer('relative_due_days'), // e.g. -14 = 14 days before anchor
  dueAnchor: text('due_anchor').default('event_start'), // 'event_start', 'event_end', 'booking_opens'
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
