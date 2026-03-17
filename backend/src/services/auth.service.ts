import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, sessions, userRoles } from '../db/schema/index.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  type JwtPayload,
} from '../lib/jwt.js';
import { config } from '../config.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../domain/errors.js';

interface RegisterInput {
  email: string;
  displayName: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  // Check if email already taken
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });
  if (existing) {
    throw new ConflictError('E-Mail-Adresse ist bereits registriert');
  }

  const passwordHash = await hashPassword(input.password);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      displayName: input.displayName,
      passwordHash,
    })
    .returning();

  // Assign default role
  await db.insert(userRoles).values({
    userId: user.id,
    role: 'employee',
  });

  const roles = ['employee'];
  return createSession(user.id, user.email, user.displayName, roles);
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Ungültige Anmeldedaten');
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    throw new UnauthorizedError('Ungültige Anmeldedaten');
  }

  const roles = await getUserRoles(user.id);

  return createSession(
    user.id,
    user.email,
    user.displayName,
    roles,
    input.ipAddress,
    input.userAgent,
  );
}

export async function refresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenHash = hashToken(refreshToken);

  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.refreshTokenHash, tokenHash),
      isNull(sessions.revokedAt),
    ),
  });

  if (!session || session.refreshExpiresAt < new Date()) {
    throw new UnauthorizedError('Ungültiger oder abgelaufener Refresh-Token');
  }

  // Revoke old session
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.id, session.id));

  // Load user + roles
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Benutzer ist deaktiviert');
  }

  const roles = await getUserRoles(user.id);

  const result = await createSession(
    user.id,
    user.email,
    user.displayName,
    roles,
  );

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
}

export async function logout(sessionId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function getMe(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw new NotFoundError('Benutzer nicht gefunden');

  const roles = await getUserRoles(user.id);

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roles,
  };
}

// --- helpers ---

async function getUserRoles(userId: string): Promise<string[]> {
  const roleRows = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, userId),
  });
  return roleRows.map((r) => r.role);
}

async function createSession(
  userId: string,
  email: string,
  displayName: string,
  roles: string[],
  ipAddress?: string,
  userAgent?: string,
): Promise<AuthResult> {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const accessTokenHash = hashToken(refreshToken + ':access'); // not stored, just for session id

  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.jwt.accessExpiresIn * 1000);
  const refreshExpiresAt = new Date(now.getTime() + config.jwt.refreshExpiresIn * 1000);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      tokenHash: accessTokenHash,
      refreshTokenHash,
      expiresAt,
      refreshExpiresAt,
      ipAddress,
      userAgent,
    })
    .returning();

  const payload: JwtPayload = {
    sub: userId,
    email,
    roles,
    sessionId: session.id,
  };

  const accessToken = await signAccessToken(payload);

  return {
    accessToken,
    refreshToken,
    user: { id: userId, email, displayName, roles },
  };
}
