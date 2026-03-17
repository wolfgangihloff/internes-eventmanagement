import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import sensible from '@fastify/sensible';
import { sql } from 'drizzle-orm';
import { db } from './db/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { routes } from './routes/index.js';

export function buildApp(opts = {}) {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
    ...opts,
  });

  // Plugins
  app.register(cors, {
    origin: true,
    credentials: true,
  });
  app.register(cookie);
  app.register(sensible);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async (_request, reply) => {
    try {
      await db.execute(sql`select 1`);
      return { status: 'ok' };
    } catch (error) {
      app.log.error({ err: error }, 'Health check failed');
      return reply.status(503).send({ status: 'degraded' });
    }
  });

  // API routes
  app.register(routes, { prefix: '/api/v1' });

  return app;
}
