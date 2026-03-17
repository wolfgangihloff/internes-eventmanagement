import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  events,
  agentSuggestions,
  tasks,
  reminders,
  participations,
  calendarEntries,
} from '../db/schema/index.js';
import { NotFoundError } from '../domain/errors.js';
import { AGENT_SYSTEM_PROMPT } from '../lib/agent-prompt.js';
import { callClaude } from '../lib/llm-client.js';
import * as audit from './audit.service.js';

interface Suggestion {
  type: string;
  title: string;
  description: string;
  actionData?: Record<string, unknown>;
}

export async function analyzeEvent(eventId: string, actorId: string) {
  // Load event with all relations
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) throw new NotFoundError('Event nicht gefunden');

  const eventTasks = await db.query.tasks.findMany({
    where: eq(tasks.eventId, eventId),
  });

  const eventReminders = await db.query.reminders.findMany({
    where: eq(reminders.eventId, eventId),
  });

  const eventParticipations = await db.query.participations.findMany({
    where: eq(participations.eventId, eventId),
  });

  const eventCalendar = await db.query.calendarEntries.findMany({
    where: eq(calendarEntries.eventId, eventId),
  });

  const context = JSON.stringify(
    {
      event: {
        title: event.title,
        status: event.status,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        bookingOpensAt: event.bookingOpensAt,
        organizer: event.organizer,
        externalUrl: event.externalUrl,
      },
      tasks: eventTasks.map((t) => ({ title: t.title, status: t.status, dueAt: t.dueAt })),
      reminders: eventReminders.map((r) => ({ title: r.title, triggerAt: r.triggerAt, isSent: r.isSent })),
      participants: eventParticipations.length,
      calendarEntries: eventCalendar.map((c) => ({ type: c.calendarType, title: c.title, isCreated: c.isCreated })),
    },
    null,
    2,
  );

  const response = await callClaude(AGENT_SYSTEM_PROMPT, context);

  // Parse suggestions
  let suggestions: Suggestion[];
  try {
    suggestions = JSON.parse(response);
    if (!Array.isArray(suggestions)) suggestions = [];
  } catch {
    suggestions = [];
  }

  // Store suggestions
  const stored = [];
  for (const s of suggestions) {
    const [row] = await db
      .insert(agentSuggestions)
      .values({
        eventId,
        type: s.type,
        title: s.title,
        description: s.description,
        actionData: s.actionData,
      })
      .returning();
    stored.push(row);
  }

  await audit.log({
    entityType: 'event',
    entityId: eventId,
    action: 'agent_analysis',
    actorId,
    actorType: 'agent',
    metadata: { suggestionCount: stored.length },
  });

  return stored;
}

export async function listSuggestions(eventId: string) {
  return db.query.agentSuggestions.findMany({
    where: eq(agentSuggestions.eventId, eventId),
  });
}

export async function resolveSuggestion(
  id: string,
  status: 'accepted' | 'dismissed',
  userId: string,
) {
  const [updated] = await db
    .update(agentSuggestions)
    .set({
      status,
      resolvedById: userId,
      resolvedAt: new Date(),
    })
    .where(eq(agentSuggestions.id, id))
    .returning();

  if (!updated) throw new NotFoundError('Vorschlag nicht gefunden');

  await audit.log({
    entityType: 'agent_suggestion',
    entityId: id,
    action: `suggestion_${status}`,
    actorId: userId,
  });

  return updated;
}
