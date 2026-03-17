// Fastify provides its own pino logger instance.
// This module re-exports a standalone logger for use outside of request context.
import pino from 'pino';

export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
