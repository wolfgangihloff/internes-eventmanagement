import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import * as taskService from '../services/task.service.js';

const createSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
  sortOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const applyTemplateSchema = z.object({
  templateId: z.string().uuid(),
});

export async function taskRoutes(app: FastifyInstance) {
  // List tasks for an event
  app.get(
    '/events/:eventId/tasks',
    { preHandler: [authenticate, requirePermission('task:read')] },
    async (request) => {
      const { eventId } = request.params as { eventId: string };
      return taskService.listByEvent(eventId);
    },
  );

  // Get my tasks across events
  app.get(
    '/users/me/tasks',
    { preHandler: [authenticate] },
    async (request) => {
      return taskService.listByAssignee(request.user.id);
    },
  );

  // Create task
  app.post(
    '/events/:eventId/tasks',
    { preHandler: [authenticate, requirePermission('task:create')] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const body = createSchema.parse(request.body);
      const task = await taskService.create({
        ...body,
        eventId,
        createdById: request.user.id,
      });
      return reply.status(201).send(task);
    },
  );

  // Apply checklist template
  app.post(
    '/events/:eventId/tasks/from-template',
    { preHandler: [authenticate, requirePermission('task:create')] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const { templateId } = applyTemplateSchema.parse(request.body);
      const tasks = await taskService.applyTemplate(eventId, templateId, request.user.id);
      return reply.status(201).send(tasks);
    },
  );

  // Update task
  app.patch(
    '/events/:eventId/tasks/:tid',
    { preHandler: [authenticate, requirePermission('task:complete')] },
    async (request) => {
      const { tid } = request.params as { eventId: string; tid: string };
      const body = updateSchema.parse(request.body);
      return taskService.update(tid, body, request.user.id);
    },
  );

  // Delete task
  app.delete(
    '/events/:eventId/tasks/:tid',
    { preHandler: [authenticate, requirePermission('task:create')] },
    async (request, reply) => {
      const { tid } = request.params as { tid: string };
      await taskService.remove(tid, request.user.id);
      return reply.status(204).send();
    },
  );
}
