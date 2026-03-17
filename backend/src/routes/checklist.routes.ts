import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import * as checklistService from '../services/checklist.service.js';

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const createItemSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  relativeDueDays: z.number().int().optional(),
  dueAnchor: z.enum(['event_start', 'event_end', 'booking_opens']).optional(),
  sortOrder: z.number().int().optional(),
});

export async function checklistRoutes(app: FastifyInstance) {
  // List templates
  app.get(
    '/checklist-templates',
    { preHandler: [authenticate] },
    async () => {
      return checklistService.listTemplates();
    },
  );

  // Get template
  app.get(
    '/checklist-templates/:id',
    { preHandler: [authenticate] },
    async (request) => {
      const { id } = request.params as { id: string };
      return checklistService.getTemplate(id);
    },
  );

  // Create template
  app.post(
    '/checklist-templates',
    { preHandler: [authenticate, requirePermission('template:manage')] },
    async (request, reply) => {
      const body = createTemplateSchema.parse(request.body);
      const template = await checklistService.createTemplate({
        ...body,
        createdById: request.user.id,
      });
      return reply.status(201).send(template);
    },
  );

  // Update template
  app.patch(
    '/checklist-templates/:id',
    { preHandler: [authenticate, requirePermission('template:manage')] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = createTemplateSchema.partial().parse(request.body);
      return checklistService.updateTemplate(id, body);
    },
  );

  // Delete template
  app.delete(
    '/checklist-templates/:id',
    { preHandler: [authenticate, requirePermission('template:manage')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await checklistService.deleteTemplate(id);
      return reply.status(204).send();
    },
  );

  // List template items
  app.get(
    '/checklist-templates/:id/items',
    { preHandler: [authenticate] },
    async (request) => {
      const { id } = request.params as { id: string };
      return checklistService.listItems(id);
    },
  );

  // Create template item
  app.post(
    '/checklist-templates/:id/items',
    { preHandler: [authenticate, requirePermission('template:manage')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = createItemSchema.parse(request.body);
      const item = await checklistService.createItem({ ...body, templateId: id });
      return reply.status(201).send(item);
    },
  );

  // Update template item
  app.patch(
    '/checklist-templates/:id/items/:iid',
    { preHandler: [authenticate, requirePermission('template:manage')] },
    async (request) => {
      const { iid } = request.params as { iid: string };
      const body = createItemSchema.partial().parse(request.body);
      return checklistService.updateItem(iid, body);
    },
  );

  // Delete template item
  app.delete(
    '/checklist-templates/:id/items/:iid',
    { preHandler: [authenticate, requirePermission('template:manage')] },
    async (request, reply) => {
      const { iid } = request.params as { iid: string };
      await checklistService.deleteItem(iid);
      return reply.status(204).send();
    },
  );
}
