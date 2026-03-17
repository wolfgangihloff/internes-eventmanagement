import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { checklistTemplates, checklistTemplateItems } from '../db/schema/index.js';
import { NotFoundError } from '../domain/errors.js';

interface CreateTemplateInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  createdById: string;
}

interface CreateItemInput {
  templateId: string;
  title: string;
  description?: string;
  relativeDueDays?: number;
  dueAnchor?: string;
  sortOrder?: number;
}

export async function listTemplates() {
  return db.query.checklistTemplates.findMany({
    orderBy: checklistTemplates.name,
  });
}

export async function getTemplate(id: string) {
  const template = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.id, id),
  });
  if (!template) throw new NotFoundError('Vorlage nicht gefunden');
  return template;
}

export async function createTemplate(input: CreateTemplateInput) {
  const [template] = await db
    .insert(checklistTemplates)
    .values({
      name: input.name,
      description: input.description,
      isDefault: input.isDefault ?? false,
      createdById: input.createdById,
    })
    .returning();
  return template;
}

export async function updateTemplate(
  id: string,
  input: Partial<Omit<CreateTemplateInput, 'createdById'>>,
) {
  await getTemplate(id);
  const [updated] = await db
    .update(checklistTemplates)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(checklistTemplates.id, id))
    .returning();
  return updated;
}

export async function deleteTemplate(id: string) {
  await getTemplate(id);
  await db.delete(checklistTemplates).where(eq(checklistTemplates.id, id));
}

// Template items
export async function listItems(templateId: string) {
  return db.query.checklistTemplateItems.findMany({
    where: eq(checklistTemplateItems.templateId, templateId),
    orderBy: checklistTemplateItems.sortOrder,
  });
}

export async function createItem(input: CreateItemInput) {
  const [item] = await db
    .insert(checklistTemplateItems)
    .values({
      templateId: input.templateId,
      title: input.title,
      description: input.description,
      relativeDueDays: input.relativeDueDays,
      dueAnchor: input.dueAnchor ?? 'event_start',
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return item;
}

export async function updateItem(
  id: string,
  input: Partial<Omit<CreateItemInput, 'templateId'>>,
) {
  const [updated] = await db
    .update(checklistTemplateItems)
    .set(input)
    .where(eq(checklistTemplateItems.id, id))
    .returning();
  if (!updated) throw new NotFoundError('Vorlageneintrag nicht gefunden');
  return updated;
}

export async function deleteItem(id: string) {
  await db.delete(checklistTemplateItems).where(eq(checklistTemplateItems.id, id));
}
