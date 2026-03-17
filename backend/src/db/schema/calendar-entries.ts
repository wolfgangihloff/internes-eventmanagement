import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { events } from './events.js';

export const calendarTypeEnum = pgEnum('calendar_type', ['internal', 'customer']);

export const calendarEntries = pgTable('calendar_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  calendarType: calendarTypeEnum('calendar_type').notNull(),
  title: text('title').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  externalRef: text('external_ref'),
  isCreated: boolean('is_created').notNull().default(false),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
