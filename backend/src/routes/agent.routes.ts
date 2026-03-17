import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import * as agentService from '../services/agent.service.js';

const resolveSchema = z.object({
  status: z.enum(['accepted', 'dismissed']),
});

export async function agentRoutes(app: FastifyInstance) {
  // List suggestions for an event
  app.get(
    '/events/:eventId/suggestions',
    { preHandler: [authenticate, requirePermission('agent:suggestions')] },
    async (request) => {
      const { eventId } = request.params as { eventId: string };
      return agentService.listSuggestions(eventId);
    },
  );

  // Generate suggestions (trigger AI analysis)
  app.post(
    '/events/:eventId/suggestions/generate',
    { preHandler: [authenticate, requirePermission('agent:suggestions')] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const suggestions = await agentService.analyzeEvent(eventId, request.user.id);
      return reply.status(201).send(suggestions);
    },
  );

  // Accept or dismiss a suggestion
  app.patch(
    '/events/:eventId/suggestions/:sid',
    { preHandler: [authenticate, requirePermission('agent:suggestions')] },
    async (request) => {
      const { sid } = request.params as { sid: string };
      const { status } = resolveSchema.parse(request.body);
      return agentService.resolveSuggestion(sid, status, request.user.id);
    },
  );
}
