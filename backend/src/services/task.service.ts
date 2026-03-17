import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks, checklistTemplates, checklistTemplateItems, events } from '../db/schema/index.js';
import { NotFoundError } from '../domain/errors.js';
import * as audit from './audit.service.js';

interface CreateTaskInput {
  eventId: string;
  title: string;
  description?: string;
  dueAt?: string;
  assigneeId?: string;
  createdById: string;
  templateItemId?: string;
  sortOrder?: number;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueAt?: string | null;
  assigneeId?: string | null;
  sortOrder?: number;
}

export async function listByEvent(eventId: string) {
  return db.query.tasks.findMany({
    where: eq(tasks.eventId, eventId),
    orderBy: tasks.sortOrder,
  });
}

export async function listByAssignee(userId: string) {
  return db.query.tasks.findMany({
    where: eq(tasks.assigneeId, userId),
  });
}

export async function getById(id: string) {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });
  if (!task) throw new NotFoundError('Aufgabe nicht gefunden');
  return task;
}

export async function create(input: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({
      eventId: input.eventId,
      title: input.title,
      description: input.description,
      dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      assigneeId: input.assigneeId,
      createdById: input.createdById,
      templateItemId: input.templateItemId,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  await audit.log({
    entityType: 'task',
    entityId: task.id,
    action: 'created',
    actorId: input.createdById,
    metadata: { eventId: input.eventId },
  });

  return task;
}

export async function update(id: string, input: UpdateTaskInput, actorId: string) {
  const existing = await getById(id);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  if (input.title !== undefined) {
    updateData.title = input.title;
    changes.title = { old: existing.title, new: input.title };
  }
  if (input.description !== undefined) {
    updateData.description = input.description;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
    if (input.status === 'completed') updateData.completedAt = new Date();
    changes.status = { old: existing.status, new: input.status };
  }
  if (input.dueAt !== undefined) {
    updateData.dueAt = input.dueAt ? new Date(input.dueAt) : null;
  }
  if (input.assigneeId !== undefined) {
    updateData.assigneeId = input.assigneeId;
  }
  if (input.sortOrder !== undefined) {
    updateData.sortOrder = input.sortOrder;
  }

  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, id))
    .returning();

  await audit.log({
    entityType: 'task',
    entityId: id,
    action: 'updated',
    actorId,
    changes,
  });

  return updated;
}

export async function remove(id: string, actorId: string) {
  await getById(id);
  await db.delete(tasks).where(eq(tasks.id, id));

  await audit.log({
    entityType: 'task',
    entityId: id,
    action: 'deleted',
    actorId,
  });
}

export async function applyTemplate(eventId: string, templateId: string, actorId: string) {
  // Load template items
  const items = await db.query.checklistTemplateItems.findMany({
    where: eq(checklistTemplateItems.templateId, templateId),
    orderBy: checklistTemplateItems.sortOrder,
  });

  if (items.length === 0) {
    throw new NotFoundError('Vorlage enthält keine Einträge');
  }

  // Load event to compute due dates
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) throw new NotFoundError('Event nicht gefunden');

  const createdTasks = [];
  for (const item of items) {
    let dueAt: Date | undefined;

    if (item.relativeDueDays != null) {
      const anchor =
        item.dueAnchor === 'event_end'
          ? event.endsAt
          : item.dueAnchor === 'booking_opens'
            ? event.bookingOpensAt
            : event.startsAt;

      if (anchor) {
        dueAt = new Date(anchor.getTime() + item.relativeDueDays * 24 * 60 * 60 * 1000);
      }
    }

    const [task] = await db
      .insert(tasks)
      .values({
        eventId,
        title: item.title,
        description: item.description,
        dueAt,
        createdById: actorId,
        templateItemId: item.id,
        sortOrder: item.sortOrder,
      })
      .returning();

    createdTasks.push(task);
  }

  await audit.log({
    entityType: 'event',
    entityId: eventId,
    action: 'template_applied',
    actorId,
    metadata: { templateId, taskCount: createdTasks.length },
  });

  return createdTasks;
}
