import { pgTable, uuid, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'proposed',
  'approved',
  'planned',
  'executed',
  'cancelled',
]);

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    externalUrl: text('external_url'),
    organizer: text('organizer'),
    industry: text('industry'),
    location: text('location'),
    venue: text('venue'),
    status: eventStatusEnum('status').notNull().default('draft'),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    bookingOpensAt: timestamp('booking_opens_at', { withTimezone: true }),
    bookingClosesAt: timestamp('booking_closes_at', { withTimezone: true }),
    notes: text('notes'),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_events_status').on(t.status), index('idx_events_starts_at').on(t.startsAt)],
);
