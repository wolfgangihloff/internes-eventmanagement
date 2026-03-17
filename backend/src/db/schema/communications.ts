import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { events } from './events.js';

export const commChannelEnum = pgEnum('comm_channel', ['email', 'in_app', 'push']);
export const commDirectionEnum = pgEnum('comm_direction', ['outbound', 'internal']);

export const communications = pgTable('communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
  channel: commChannelEnum('channel').notNull().default('in_app'),
  direction: commDirectionEnum('direction').notNull().default('internal'),
  subject: text('subject'),
  body: text('body').notNull(),
  senderId: uuid('sender_id').references(() => users.id),
  recipientIds: uuid('recipient_ids').array().notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
