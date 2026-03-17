import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import * as reminderService from '../services/reminder.service.js';

const createSchema = z.object({
  taskId: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  message: z.string().optional(),
  triggerType: z.enum(['time_based', 'condition_based']).optional(),
  triggerAt: z.string().datetime().optional(),
  relativeDueDays: z.string().optional(),
  anchorField: z.string().optional(),
  recipientIds: z.array(z.string().uuid()).optional(),
});

const updateSchema = createSchema.partial().omit({ taskId: true, triggerType: true });

export async function reminderRoutes(app: FastifyInstance) {
  app.get(
    '/events/:eventId/reminders',
    { preHandler: [authenticate, requirePermission('reminder:read')] },
    async (request) => {
      const { eventId } = request.params as { eventId: string };
      return reminderService.listByEvent(eventId);
    },
  );

  app.post(
    '/events/:eventId/reminders',
    { preHandler: [authenticate, requirePermission('reminder:manage')] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const body = createSchema.parse(request.body);
      const reminder = await reminderService.create({
        ...body,
        eventId,
        createdById: request.user.id,
      });
      return reply.status(201).send(reminder);
    },
  );

  app.patch(
    '/events/:eventId/reminders/:rid',
    { preHandler: [authenticate, requirePermission('reminder:manage')] },
    async (request) => {
      const { rid } = request.params as { rid: string };
      const body = updateSchema.parse(request.body);
      return reminderService.update(rid, body, request.user.id);
    },
  );

  app.delete(
    '/events/:eventId/reminders/:rid',
    { preHandler: [authenticate, requirePermission('reminder:manage')] },
    async (request, reply) => {
      const { rid } = request.params as { rid: string };
      await reminderService.remove(rid, request.user.id);
      return reply.status(204).send();
    },
  );
}
