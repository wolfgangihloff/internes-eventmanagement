import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import {
  requirePermission,
  resolveEventCreationStatus,
} from '../middleware/authorize.js';
import * as eventService from '../services/event.service.js';
import { getAvailableTransitions, type EventStatus } from '../domain/event-machine.js';

const createSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  organizer: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  venue: z.string().optional(),
  status: z.enum(['draft', 'proposed']).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  bookingOpensAt: z.string().datetime().optional(),
  bookingClosesAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial().omit({ status: true });

const transitionSchema = z.object({
  to: z.enum(['draft', 'proposed', 'approved', 'planned', 'executed', 'cancelled']),
});

export async function eventRoutes(app: FastifyInstance) {
  // List events
  app.get(
    '/events',
    { preHandler: [authenticate, requirePermission('event:read')] },
    async (request) => {
      const query = request.query as Record<string, string>;
      return eventService.list({
        status: query.status as EventStatus | undefined,
        industry: query.industry,
        search: query.search,
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      });
    },
  );

  // Get single event
  app.get(
    '/events/:id',
    { preHandler: [authenticate, requirePermission('event:read')] },
    async (request) => {
      const { id } = request.params as { id: string };
      const event = await eventService.getById(id);
      const transitions = getAvailableTransitions(event.status, request.user.roles);
      return { ...event, availableTransitions: transitions };
    },
  );

  // Create event
  app.post(
    '/events',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = createSchema.parse(request.body);
      const status = resolveEventCreationStatus(request.user.roles, body.status);
      const event = await eventService.create({
        ...body,
        status,
        createdById: request.user.id,
      });
      return reply.status(201).send(event);
    },
  );

  // Update event
  app.patch(
    '/events/:id',
    { preHandler: [authenticate, requirePermission('event:update')] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = updateSchema.parse(request.body);
      return eventService.update(id, body, request.user.id);
    },
  );

  // Delete event
  app.delete(
    '/events/:id',
    { preHandler: [authenticate, requirePermission('event:delete')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await eventService.remove(id, request.user.id);
      return reply.status(204).send();
    },
  );

  // Transition event status
  app.post(
    '/events/:id/transition',
    { preHandler: [authenticate, requirePermission('event:transition')] },
    async (request) => {
      const { id } = request.params as { id: string };
      const { to } = transitionSchema.parse(request.body);
      return eventService.transition(id, to, {
        id: request.user.id,
        roles: request.user.roles,
      });
    },
  );
}
