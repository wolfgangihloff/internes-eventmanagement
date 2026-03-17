import { eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, userRoles } from '../db/schema/index.js';
import { hashPassword } from '../lib/password.js';
import { ConflictError, NotFoundError } from '../domain/errors.js';

export const VALID_ROLES = ['employee', 'manager', 'event_admin', 'marketing'] as const;
export type Role = (typeof VALID_ROLES)[number];

interface UserWithRoles {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
}

interface CreateUserInput {
  email: string;
  displayName: string;
  password: string;
  roles: Role[];
}

interface UpdateUserInput {
  displayName?: string;
  isActive?: boolean;
}

export async function listUsers(search?: string): Promise<UserWithRoles[]> {
  const whereClause = search
    ? or(ilike(users.email, `%${search}%`), ilike(users.displayName, `%${search}%`))
    : undefined;

  const allUsers = await db.query.users.findMany({
    where: whereClause,
    orderBy: (u, { asc }) => [asc(u.displayName)],
  });

  const allRoles = await db.query.userRoles.findMany();

  const rolesByUser = new Map<string, string[]>();
  for (const r of allRoles) {
    const list = rolesByUser.get(r.userId) ?? [];
    list.push(r.role);
    rolesByUser.set(r.userId, list);
  }

  return allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    isActive: u.isActive,
    roles: rolesByUser.get(u.id) ?? [],
    createdAt: u.createdAt,
  }));
}

export async function createUser(input: CreateUserInput): Promise<UserWithRoles> {
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

  const rolesToInsert = input.roles.length > 0 ? input.roles : (['employee'] as Role[]);
  for (const role of rolesToInsert) {
    await db.insert(userRoles).values({ userId: user.id, role });
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isActive: user.isActive,
    roles: rolesToInsert,
    createdAt: user.createdAt,
  };
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<UserWithRoles> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new NotFoundError('Benutzer nicht gefunden');

  const [updated] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  const roles = await db.query.userRoles.findMany({ where: eq(userRoles.userId, userId) });

  return {
    id: updated.id,
    email: updated.email,
    displayName: updated.displayName,
    isActive: updated.isActive,
    roles: roles.map((r) => r.role),
    createdAt: updated.createdAt,
  };
}

export async function setUserRoles(userId: string, roles: Role[]): Promise<UserWithRoles> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new NotFoundError('Benutzer nicht gefunden');

  // Remove all existing roles, then insert new ones
  await db.delete(userRoles).where(eq(userRoles.userId, userId));

  for (const role of roles) {
    await db.insert(userRoles).values({ userId, role });
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isActive: user.isActive,
    roles,
    createdAt: user.createdAt,
  };
}

export async function resetPassword(userId: string, newPassword: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new NotFoundError('Benutzer nicht gefunden');

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
