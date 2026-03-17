import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { config } from '../config.js';

const registerSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  displayName: z.string().min(1, 'Name ist erforderlich').max(200),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await authService.register(body);

    setRefreshCookie(reply, result.refreshToken);

    return reply.status(201).send({
      accessToken: result.accessToken,
      user: result.user,
    });
  });

  app.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await authService.login({
      ...body,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    setRefreshCookie(reply, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  });

  app.post('/auth/refresh', async (request, reply) => {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Kein Refresh-Token' });
    }

    const result = await authService.refresh(refreshToken);

    setRefreshCookie(reply, result.refreshToken);

    return { accessToken: result.accessToken };
  });

  app.post(
    '/auth/logout',
    { preHandler: [authenticate] },
    async (request, reply) => {
      await authService.logout(request.user.sessionId);
      reply.clearCookie('refreshToken', { path: '/api/v1/auth' });
      return { success: true };
    },
  );

  app.get(
    '/auth/me',
    { preHandler: [authenticate] },
    async (request) => {
      return authService.getMe(request.user.id);
    },
  );
}

function setRefreshCookie(reply: any, token: string) {
  reply.setCookie('refreshToken', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: config.jwt.refreshExpiresIn,
  });
}
