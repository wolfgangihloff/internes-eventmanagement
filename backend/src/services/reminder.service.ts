import { eq, and, lte, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { reminders, events } from '../db/schema/index.js';
import { NotFoundError } from '../domain/errors.js';
import * as audit from './audit.service.js';

interface CreateReminderInput {
  eventId?: string;
  taskId?: string;
  title: string;
  message?: string;
  triggerType?: 'time_based' | 'condition_based';
  triggerAt?: string;
  relativeDueDays?: string;
  anchorField?: string;
  recipientIds?: string[];
  createdById: string;
}

interface UpdateReminderInput {
  title?: string;
  message?: string;
  triggerAt?: string | null;
  relativeDueDays?: string;
  anchorField?: string;
  recipientIds?: string[];
}

export async function listByEvent(eventId: string) {
  return db.query.reminders.findMany({
    where: eq(reminders.eventId, eventId),
  });
}

export async function create(input: CreateReminderInput) {
  const [reminder] = await db
    .insert(reminders)
    .values({
      eventId: input.eventId,
      taskId: input.taskId,
      title: input.title,
      message: input.message,
      triggerType: input.triggerType ?? 'time_based',
      triggerAt: input.triggerAt ? new Date(input.triggerAt) : undefined,
      relativeDueDays: input.relativeDueDays,
      anchorField: input.anchorField,
      recipientIds: input.recipientIds,
      createdById: input.createdById,
    })
    .returning();

  await audit.log({
    entityType: 'reminder',
    entityId: reminder.id,
    action: 'created',
    actorId: input.createdById,
  });

  return reminder;
}

export async function update(id: string, input: UpdateReminderInput, actorId: string) {
  const existing = await db.query.reminders.findFirst({
    where: eq(reminders.id, id),
  });
  if (!existing) throw new NotFoundError('Erinnerung nicht gefunden');

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updateData.title = input.title;
  if (input.message !== undefined) updateData.message = input.message;
  if (input.triggerAt !== undefined) {
    updateData.triggerAt = input.triggerAt ? new Date(input.triggerAt) : null;
  }
  if (input.relativeDueDays !== undefined) updateData.relativeDueDays = input.relativeDueDays;
  if (input.anchorField !== undefined) updateData.anchorField = input.anchorField;
  if (input.recipientIds !== undefined) updateData.recipientIds = input.recipientIds;

  const [updated] = await db
    .update(reminders)
    .set(updateData)
    .where(eq(reminders.id, id))
    .returning();

  await audit.log({
    entityType: 'reminder',
    entityId: id,
    action: 'updated',
    actorId,
  });

  return updated;
}

export async function remove(id: string, actorId: string) {
  await db.delete(reminders).where(eq(reminders.id, id));

  await audit.log({
    entityType: 'reminder',
    entityId: id,
    action: 'deleted',
    actorId,
  });
}

/** Recompute trigger times for all reminders of an event after date changes */
export async function recomputeForEvent(eventId: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) return;

  const eventReminders = await db.query.reminders.findMany({
    where: and(eq(reminders.eventId, eventId), eq(reminders.isSent, false)),
  });

  for (const reminder of eventReminders) {
    if (reminder.relativeDueDays && reminder.anchorField) {
      const days = parseInt(reminder.relativeDueDays, 10);
      if (isNaN(days)) continue;

      const anchor =
        reminder.anchorField === 'ends_at'
          ? event.endsAt
          : reminder.anchorField === 'booking_opens_at'
            ? event.bookingOpensAt
            : event.startsAt;

      if (anchor) {
        const triggerAt = new Date(anchor.getTime() + days * 24 * 60 * 60 * 1000);
        await db
          .update(reminders)
          .set({ triggerAt, updatedAt: new Date() })
          .where(eq(reminders.id, reminder.id));
      }
    }
  }
}

/** Find all due reminders that haven't been sent yet */
export async function findDueReminders() {
  return db.query.reminders.findMany({
    where: and(
      eq(reminders.isSent, false),
      lte(reminders.triggerAt, new Date()),
    ),
  });
}

export async function markSent(id: string) {
  await db
    .update(reminders)
    .set({ isSent: true, sentAt: new Date(), updatedAt: new Date() })
    .where(eq(reminders.id, id));
}
