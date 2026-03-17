import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as userService from '../services/user.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const VALID_ROLES = ['employee', 'manager', 'event_admin', 'marketing'] as const;

const createUserSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  displayName: z.string().min(1, 'Name ist erforderlich').max(200),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  roles: z.array(z.enum(VALID_ROLES)).min(1, 'Mindestens eine Rolle erforderlich'),
});

const updateUserSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
});

const setRolesSchema = z.object({
  roles: z.array(z.enum(VALID_ROLES)).min(1, 'Mindestens eine Rolle erforderlich'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
});

export async function userRoutes(app: FastifyInstance) {
  // All routes require auth + user:manage permission
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requirePermission('user:manage'));

  // GET /users — list all users
  app.get('/users', async (request) => {
    const { search } = request.query as { search?: string };
    return userService.listUsers(search);
  });

  // POST /users — create a new user
  app.post('/users', async (request, reply) => {
    const body = createUserSchema.parse(request.body);
    const user = await userService.createUser(body);
    return reply.status(201).send(user);
  });

  // PATCH /users/:id — update user details
  app.patch('/users/:id', async (request) => {
    const { id } = request.params as { id: string };
    const body = updateUserSchema.parse(request.body);
    return userService.updateUser(id, body);
  });

  // PUT /users/:id/roles — set user roles
  app.put('/users/:id/roles', async (request) => {
    const { id } = request.params as { id: string };
    const body = setRolesSchema.parse(request.body);
    return userService.setUserRoles(id, body.roles);
  });

  // POST /users/:id/reset-password — admin reset password
  app.post('/users/:id/reset-password', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = resetPasswordSchema.parse(request.body);
    await userService.resetPassword(id, body.password);
    return reply.status(204).send();
  });
}
