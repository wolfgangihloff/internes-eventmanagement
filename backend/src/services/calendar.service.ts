import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { calendarEntries } from '../db/schema/index.js';
import type { CalendarType } from '../domain/calendar-types.js';
import { NotFoundError } from '../domain/errors.js';

interface CreateCalendarEntryInput {
  eventId: string;
  calendarType: CalendarType;
  title: string;
  startsAt?: string;
  endsAt?: string;
  externalRef?: string;
  createdById: string;
}

interface UpdateCalendarEntryInput {
  title?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  externalRef?: string;
  isCreated?: boolean;
}

export async function listByEvent(eventId: string) {
  return db.query.calendarEntries.findMany({
    where: eq(calendarEntries.eventId, eventId),
  });
}

export async function create(input: CreateCalendarEntryInput) {
  const [entry] = await db
    .insert(calendarEntries)
    .values({
      eventId: input.eventId,
      calendarType: input.calendarType,
      title: input.title,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      externalRef: input.externalRef,
      createdById: input.createdById,
    })
    .returning();
  return entry;
}

export async function update(id: string, input: UpdateCalendarEntryInput) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updateData.title = input.title;
  if (input.startsAt !== undefined)
    updateData.startsAt = input.startsAt ? new Date(input.startsAt) : null;
  if (input.endsAt !== undefined)
    updateData.endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if (input.externalRef !== undefined) updateData.externalRef = input.externalRef;
  if (input.isCreated !== undefined) updateData.isCreated = input.isCreated;

  const [updated] = await db
    .update(calendarEntries)
    .set(updateData)
    .where(eq(calendarEntries.id, id))
    .returning();

  if (!updated) throw new NotFoundError('Kalendereintrag nicht gefunden');
  return updated;
}

export async function remove(id: string) {
  await db.delete(calendarEntries).where(eq(calendarEntries.id, id));
}
