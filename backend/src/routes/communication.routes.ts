import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import * as communicationService from '../services/communication.service.js';

const createSchema = z.object({
  channel: z.enum(['email', 'in_app', 'push']).optional(),
  direction: z.enum(['outbound', 'internal']).optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  recipientIds: z.array(z.string().uuid()).min(1),
});

export async function communicationRoutes(app: FastifyInstance) {
  app.get(
    '/events/:eventId/communications',
    { preHandler: [authenticate, requirePermission('communication:read')] },
    async (request) => {
      const { eventId } = request.params as { eventId: string };
      return communicationService.listByEvent(eventId);
    },
  );

  app.post(
    '/events/:eventId/communications',
    { preHandler: [authenticate, requirePermission('communication:send')] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const body = createSchema.parse(request.body);
      const comm = await communicationService.create({
        ...body,
        eventId,
        senderId: request.user.id,
      });
      return reply.status(201).send(comm);
    },
  );
}
