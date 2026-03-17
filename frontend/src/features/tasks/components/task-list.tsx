import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/common/can';
import { useTasks, useCreateTask, useUpdateTask } from '../hooks/use-tasks';
import { Plus, Check } from 'lucide-react';
import type { TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Offen',
  in_progress: 'In Bearbeitung',
  completed: 'Erledigt',
  skipped: 'Übersprungen',
};

interface TaskListProps {
  eventId: string;
}

export function TaskList({ eventId }: TaskListProps) {
  const { data: tasks, isLoading } = useTasks(eventId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    createTask.mutate(
      { eventId, title: newTitle },
      { onSuccess: () => { setNewTitle(''); setShowAdd(false); } },
    );
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Aufgaben ({tasks?.length ?? 0})</CardTitle>
        <Can permission="task:create">
          <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="mr-1 h-4 w-4" />
            Aufgabe
          </Button>
        </Can>
      </CardHeader>
      <CardContent>
        {showAdd && (
          <div className="mb-4 flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Neue Aufgabe..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button size="sm" onClick={handleAddTask} disabled={createTask.isPending}>
              Hinzufügen
            </Button>
          </div>
        )}

        {tasks?.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Aufgaben vorhanden.</p>
        ) : (
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      task.status === 'completed'
                        ? 'border-primary bg-primary text-white'
                        : 'border-muted-foreground'
                    }`}
                    onClick={() =>
                      updateTask.mutate({
                        eventId,
                        taskId: task.id,
                        status: task.status === 'completed' ? 'pending' : 'completed',
                      })
                    }
                  >
                    {task.status === 'completed' && <Check className="h-3 w-3" />}
                  </button>
                  <span
                    className={`text-sm ${
                      task.status === 'completed' ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {task.dueAt && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(task.dueAt), 'd. MMM', { locale: de })}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
