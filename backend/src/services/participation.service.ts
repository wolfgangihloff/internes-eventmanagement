import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { participations, users, events } from '../db/schema/index.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../domain/errors.js';
import * as audit from './audit.service.js';

type ParticipationStatus = 'applied' | 'approved' | 'rejected' | 'confirmed' | 'withdrawn';

export async function listByEvent(eventId: string) {
  const rows = await db.query.participations.findMany({
    where: eq(participations.eventId, eventId),
  });

  if (rows.length === 0) return [];

  // Resolve user display info
  const userIds = [...new Set(rows.map((r) => r.userId))];
  const userRows = await db.query.users.findMany({
    where: inArray(users.id, userIds),
  });
  const userMap = new Map(userRows.map((u) => [u.id, { email: u.email, displayName: u.displayName }]));

  return rows.map((r) => ({
    ...r,
    userEmail: userMap.get(r.userId)?.email ?? null,
    userDisplayName: userMap.get(r.userId)?.displayName ?? null,
  }));
}

export async function listByUser(userId: string) {
  const rows = await db.query.participations.findMany({
    where: eq(participations.userId, userId),
  });

  if (rows.length === 0) return [];

  // Resolve event info
  const eventIds = [...new Set(rows.map((r) => r.eventId))];
  const eventRows = await db.query.events.findMany({
    where: inArray(events.id, eventIds),
  });
  const eventMap = new Map(eventRows.map((e) => [e.id, e]));

  return rows.map((r) => ({
    ...r,
    event: eventMap.get(r.eventId) ?? null,
  }));
}

export async function apply(eventId: string, userId: string, rationale?: string) {
  // Check for duplicate
  const existing = await db.query.participations.findFirst({
    where: and(eq(participations.eventId, eventId), eq(participations.userId, userId)),
  });
  if (existing) {
    throw new ConflictError('Du hast dich bereits für dieses Event beworben');
  }

  const [participation] = await db
    .insert(participations)
    .values({
      eventId,
      userId,
      rationale,
      status: 'applied',
    })
    .returning();

  await audit.log({
    entityType: 'participation',
    entityId: participation.id,
    action: 'applied',
    actorId: userId,
    metadata: { eventId },
  });

  return participation;
}

export async function decide(
  participationId: string,
  decision: 'approved' | 'rejected',
  decidedById: string,
) {
  const participation = await db.query.participations.findFirst({
    where: eq(participations.id, participationId),
  });

  if (!participation) throw new NotFoundError('Teilnahme nicht gefunden');

  if (participation.status !== 'applied') {
    throw new ConflictError('Über diese Bewerbung wurde bereits entschieden');
  }

  const [updated] = await db
    .update(participations)
    .set({
      status: decision,
      decidedById,
      decidedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(participations.id, participationId))
    .returning();

  await audit.log({
    entityType: 'participation',
    entityId: participationId,
    action: `participation_${decision}`,
    actorId: decidedById,
    changes: { status: { old: 'applied', new: decision } },
  });

  return updated;
}

export async function confirm(participationId: string, userId: string) {
  const participation = await db.query.participations.findFirst({
    where: eq(participations.id, participationId),
  });

  if (!participation) throw new NotFoundError('Teilnahme nicht gefunden');
  if (participation.status !== 'approved') {
    throw new ConflictError('Nur genehmigte Teilnahmen können bestätigt werden');
  }

  const [updated] = await db
    .update(participations)
    .set({ status: 'confirmed', updatedAt: new Date() })
    .where(eq(participations.id, participationId))
    .returning();

  await audit.log({
    entityType: 'participation',
    entityId: participationId,
    action: 'confirmed',
    actorId: userId,
  });

  return updated;
}

export async function withdraw(participationId: string, userId: string) {
  const participation = await db.query.participations.findFirst({
    where: eq(participations.id, participationId),
  });

  if (!participation) throw new NotFoundError('Teilnahme nicht gefunden');
  if (participation.userId !== userId) {
    throw new ForbiddenError('Du kannst nur eigene Bewerbungen zurückziehen');
  }

  const [updated] = await db
    .update(participations)
    .set({ status: 'withdrawn', updatedAt: new Date() })
    .where(eq(participations.id, participationId))
    .returning();

  await audit.log({
    entityType: 'participation',
    entityId: participationId,
    action: 'withdrawn',
    actorId: userId,
  });

  return updated;
}
