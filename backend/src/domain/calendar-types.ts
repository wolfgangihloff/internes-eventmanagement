export const CALENDAR_TYPES = ['internal', 'customer'] as const;

export type CalendarType = (typeof CALENDAR_TYPES)[number];
