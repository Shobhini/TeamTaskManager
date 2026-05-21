import { Link } from 'react-router-dom';
import Badge from './Badge';
import Avatar from './Avatar';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

const priorityBorder: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW: '',
};

export default function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const borderAccent = priorityBorder[task.priority] ?? '';

  return (
    <Link
      to={`/projects/${projectId}/tasks/${task.id}`}
      className={`block bg-[#1A1A1A] border border-[#2A2A2A] hover:border-zinc-600 rounded-lg p-3 transition-colors border-l-2 ${
        borderAccent || 'border-l-[#2A2A2A]'
      }`}
    >
      <p className="text-sm font-medium text-[#F5F5F5] mb-2 leading-snug">{task.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <Badge type="status" value={task.status} />
        <Badge type="priority" value={task.priority} />
      </div>
      <div className="flex items-center justify-between mt-1">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignee.name} size="sm" />
            <span className="text-xs text-zinc-500 truncate max-w-[80px]">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-zinc-700">Unassigned</span>
        )}
        {task.dueDate && (
          <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-zinc-600'}`}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && ' · !!'}
          </span>
        )}
      </div>
    </Link>
  );
}
