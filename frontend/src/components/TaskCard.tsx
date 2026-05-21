import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

export default function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <Link
      to={`/projects/${projectId}/tasks/${task.id}`}
      className={`block bg-white border rounded-lg p-3 shadow-sm hover:shadow transition-shadow ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}
    >
      <p className="font-medium text-gray-800 text-sm">{task.title}</p>
      <div className="flex items-center gap-2 mt-2">
        <StatusBadge status={task.status} />
        <span className={`text-xs ${task.priority === 'HIGH' ? 'text-red-500' : task.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-gray-400'}`}>
          {task.priority}
        </span>
      </div>
      {task.assignee && (
        <p className="text-xs text-gray-500 mt-1">Assigned: {task.assignee.name}</p>
      )}
      {task.dueDate && (
        <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </Link>
  );
}
