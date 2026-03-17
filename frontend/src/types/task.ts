export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueAt?: string | null;
  completedAt?: string | null;
  assigneeId?: string | null;
  createdById?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
