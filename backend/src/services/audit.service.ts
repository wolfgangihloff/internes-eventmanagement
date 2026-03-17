import { db } from '../db/index.js';
import { auditLog } from '../db/schema/index.js';

interface AuditInput {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  actorType?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function log(input: AuditInput): Promise<void> {
  await db.insert(auditLog).values({
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    actorId: input.actorId,
    actorType: input.actorType ?? 'user',
    changes: input.changes,
    metadata: input.metadata,
  });
}
