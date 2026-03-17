import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CALENDAR_TYPES } from '../domain/calendar-types.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import * as calendarService from '../services/calendar.service.js';

const createSchema = z.object({
  calendarType: z.enum(CALENDAR_TYPES),
  title: z.string().min(1).max(300),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  externalRef: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  externalRef: z.string().optional(),
  isCreated: z.boolean().optional(),
});

export async function calendarRoutes(app: FastifyInstance) {
  app.get(
    '/events/:eventId/calendar-entries',
    { preHandler: [authenticate, requirePermission('calendar:read')] },
    async (request) => {
      const { eventId } = request.params as { eventId: string };
      return calendarService.listByEvent(eventId);
    },
  );

  app.post(
    '/events/:eventId/calendar-entries',
    { preHandler: [authenticate, requirePermission('calendar:manage')] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const body = createSchema.parse(request.body);
      const entry = await calendarService.create({
        ...body,
        eventId,
        createdById: request.user.id,
      });
      return reply.status(201).send(entry);
    },
  );

  app.patch(
    '/events/:eventId/calendar-entries/:cid',
    { preHandler: [authenticate, requirePermission('calendar:manage')] },
    async (request) => {
      const { cid } = request.params as { cid: string };
      const body = updateSchema.parse(request.body);
      return calendarService.update(cid, body);
    },
  );

  app.delete(
    '/events/:eventId/calendar-entries/:cid',
    { preHandler: [authenticate, requirePermission('calendar:manage')] },
    async (request, reply) => {
      const { cid } = request.params as { cid: string };
      await calendarService.remove(cid);
      return reply.status(204).send();
    },
  );
}
