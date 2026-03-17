import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../lib/jwt.js';
import { UnauthorizedError } from '../domain/errors.js';

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Kein Authentifizierungs-Token vorhanden');
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyAccessToken(token);
    request.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      sessionId: payload.sessionId,
    };
  } catch {
    throw new UnauthorizedError('Ungültiger oder abgelaufener Token');
  }
}
