import { eq, desc, and, ilike, inArray, lte, gte, isNull, or, SQL } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events } from '../db/schema/index.js';
import { validateTransition, type EventStatus } from '../domain/event-machine.js';
import { NotFoundError } from '../domain/errors.js';
import * as audit from './audit.service.js';

interface CreateEventInput {
  title: string;
  description?: string;
  externalUrl?: string;
  organizer?: string;
  industry?: string;
  location?: string;
  venue?: string;
  status?: 'draft' | 'proposed';
  startsAt?: string;
  endsAt?: string;
  bookingOpensAt?: string;
  bookingClosesAt?: string;
  notes?: string;
  createdById: string;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  externalUrl?: string;
  organizer?: string;
  industry?: string;
  location?: string;
  venue?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  bookingOpensAt?: string | null;
  bookingClosesAt?: string | null;
  notes?: string;
}

interface EventFilters {
  status?: EventStatus;
  industry?: string;
  search?: string;
  upcoming?: boolean;
  page?: number;
  pageSize?: number;
}

export async function list(filters: EventFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [];
  if (filters.status) {
    conditions.push(eq(events.status, filters.status));
  }
  if (filters.industry) {
    conditions.push(eq(events.industry, filters.industry));
  }
  if (filters.search) {
    conditions.push(ilike(events.title, `%${filters.search}%`));
  }
  if (filters.upcoming) {
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    conditions.push(
      or(
        isNull(events.startsAt),
        and(gte(events.startsAt, now), lte(events.startsAt, in90Days)),
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db.query.events.findMany({
    where,
    orderBy: [desc(events.startsAt), desc(events.createdAt)],
    limit: pageSize,
    offset,
  });

  // Count total
  const allMatching = await db.query.events.findMany({ where });
  const total = allMatching.length;

  return { items, total, page, pageSize };
}

export async function getById(id: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  });
  if (!event) throw new NotFoundError('Event nicht gefunden');
  return event;
}

export async function create(input: CreateEventInput) {
  const [event] = await db
    .insert(events)
    .values({
      title: input.title,
      description: input.description,
      externalUrl: input.externalUrl,
      organizer: input.organizer,
      industry: input.industry,
      location: input.location,
      venue: input.venue,
      status: input.status ?? 'draft',
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      bookingOpensAt: input.bookingOpensAt ? new Date(input.bookingOpensAt) : undefined,
      bookingClosesAt: input.bookingClosesAt ? new Date(input.bookingClosesAt) : undefined,
      notes: input.notes,
      createdById: input.createdById,
    })
    .returning();

  await audit.log({
    entityType: 'event',
    entityId: event.id,
    action: 'created',
    actorId: input.createdById,
  });

  return event;
}

export async function update(id: string, input: UpdateEventInput, actorId: string) {
  const existing = await getById(id);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      const dateFields = ['startsAt', 'endsAt', 'bookingOpensAt', 'bookingClosesAt'];
      const newVal = dateFields.includes(key) && value ? new Date(value as string) : value;
      updateData[key] = newVal;
      changes[key] = { old: (existing as any)[key], new: newVal };
    }
  }

  const [updated] = await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, id))
    .returning();

  await audit.log({
    entityType: 'event',
    entityId: id,
    action: 'updated',
    actorId,
    changes,
  });

  return updated;
}

export async function transition(
  id: string,
  targetStatus: EventStatus,
  actor: { id: string; roles: string[] },
) {
  const event = await getById(id);

  validateTransition(event.status, targetStatus, actor);

  const [updated] = await db
    .update(events)
    .set({ status: targetStatus, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();

  await audit.log({
    entityType: 'event',
    entityId: id,
    action: 'status_changed',
    actorId: actor.id,
    changes: { status: { old: event.status, new: targetStatus } },
  });

  return updated;
}

export async function remove(id: string, actorId: string) {
  await getById(id); // ensure exists
  await db.delete(events).where(eq(events.id, id));

  await audit.log({
    entityType: 'event',
    entityId: id,
    action: 'deleted',
    actorId,
  });
}
