import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import * as participationService from '../services/participation.service.js';

const applySchema = z.object({
  rationale: z.string().optional(),
});

const decideSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
});

export async function participationRoutes(app: FastifyInstance) {
  // List participations for an event
  app.get(
    '/events/:eventId/participations',
    { preHandler: [authenticate, requirePermission('participation:read')] },
    async (request) => {
      const { eventId } = request.params as { eventId: string };
      return participationService.listByEvent(eventId);
    },
  );

  // Apply to participate
  app.post(
    '/events/:eventId/participations',
    { preHandler: [authenticate, requirePermission('participation:apply')] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const body = applySchema.parse(request.body);
      const participation = await participationService.apply(
        eventId,
        request.user.id,
        body.rationale,
      );
      return reply.status(201).send(participation);
    },
  );

  // Approve or reject participation
  app.patch(
    '/events/:eventId/participations/:pid',
    { preHandler: [authenticate, requirePermission('participation:decide')] },
    async (request) => {
      const { pid } = request.params as { eventId: string; pid: string };
      const { decision } = decideSchema.parse(request.body);
      return participationService.decide(pid, decision, request.user.id);
    },
  );

  // Withdraw own participation
  app.delete(
    '/events/:eventId/participations/:pid',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { pid } = request.params as { pid: string };
      await participationService.withdraw(pid, request.user.id);
      return reply.status(204).send();
    },
  );
}
