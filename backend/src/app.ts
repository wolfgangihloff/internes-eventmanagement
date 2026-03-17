import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import sensible from '@fastify/sensible';
import { errorHandler } from './middleware/error-handler.js';

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
  app.get('/health', async () => ({ status: 'ok' }));

  // API routes will be registered here
  // app.register(routes, { prefix: '/api/v1' });

  return app;
}
