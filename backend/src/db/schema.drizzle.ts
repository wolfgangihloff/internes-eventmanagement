/**
 * Flat schema file for drizzle-kit (which processes files as CJS and cannot
 * resolve .js extension imports). The canonical schema lives in schema/*.ts
 * and is used at runtime by the application. This file re-exports everything
 * via relative .ts imports so drizzle-kit can read it.
 */
export { users } from './schema/users.ts';
export { teams, teamMemberships } from './schema/teams.ts';
export { userRoles } from './schema/user-roles.ts';
export { sessions } from './schema/sessions.ts';
export { events, eventStatusEnum } from './schema/events.ts';
export { participations, participationStatusEnum } from './schema/participations.ts';
export { checklistTemplates, checklistTemplateItems } from './schema/checklist-templates.ts';
export { tasks, taskStatusEnum } from './schema/tasks.ts';
export { reminders, reminderTriggerTypeEnum } from './schema/reminders.ts';
export { communications, commChannelEnum, commDirectionEnum } from './schema/communications.ts';
export { calendarEntries, calendarTypeEnum } from './schema/calendar-entries.ts';
export { auditLog } from './schema/audit-log.ts';
export { agentSuggestions, suggestionStatusEnum } from './schema/agent-suggestions.ts';
