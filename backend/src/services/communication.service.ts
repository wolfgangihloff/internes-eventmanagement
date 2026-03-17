import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { communications } from '../db/schema/index.js';

interface CreateCommunicationInput {
  eventId?: string;
  channel?: 'email' | 'in_app' | 'push';
  direction?: 'outbound' | 'internal';
  subject?: string;
  body: string;
  senderId: string;
  recipientIds: string[];
}

export async function listByEvent(eventId: string) {
  return db.query.communications.findMany({
    where: eq(communications.eventId, eventId),
    orderBy: communications.createdAt,
  });
}

export async function create(input: CreateCommunicationInput) {
  const [comm] = await db
    .insert(communications)
    .values({
      eventId: input.eventId,
      channel: input.channel ?? 'in_app',
      direction: input.direction ?? 'internal',
      subject: input.subject,
      body: input.body,
      senderId: input.senderId,
      recipientIds: input.recipientIds,
      sentAt: new Date(),
    })
    .returning();
  return comm;
}
