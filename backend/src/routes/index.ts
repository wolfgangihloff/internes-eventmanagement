import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { eventRoutes } from './event.routes.js';
import { participationRoutes } from './participation.routes.js';
import { taskRoutes } from './task.routes.js';
import { checklistRoutes } from './checklist.routes.js';
import { reminderRoutes } from './reminder.routes.js';
import { calendarRoutes } from './calendar.routes.js';
import { communicationRoutes } from './communication.routes.js';
import { agentRoutes } from './agent.routes.js';
import { userRoutes } from './user.routes.js';

export async function routes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(eventRoutes);
  app.register(participationRoutes);
  app.register(taskRoutes);
  app.register(checklistRoutes);
  app.register(reminderRoutes);
  app.register(calendarRoutes);
  app.register(communicationRoutes);
  app.register(agentRoutes);
  app.register(userRoutes);
}
