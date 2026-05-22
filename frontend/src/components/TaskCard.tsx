import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from './Avatar';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

const priorityBorderColor: Record<string, string> = {
  HIGH: '#CD4945',
  MEDIUM: '#CA8E1B',
};

export default function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const borderColor = priorityBorderColor[task.priority];

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <Link
        to={`/projects/${projectId}/tasks/${task.id}`}
        className="block bg-[#2F3437] border border-white/10 hover:border-white/20 rounded-lg p-3 transition-colors"
        style={borderColor ? { borderLeft: `3px solid ${borderColor}` } : undefined}
      >
        <p className="text-[13px] font-medium text-[#D4D4D4] leading-snug mb-2">
          {task.title}
        </p>

        <div className="flex items-center justify-between">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <Avatar name={task.assignee.name} size="sm" />
              <span className="text-[11px] text-[#6B6B6B] truncate max-w-[80px]">
                {task.assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#454B4E]">Unassigned</span>
          )}

          <div className="flex items-center gap-1.5">
            {isOverdue && (
              <span className="text-[10px] font-medium text-[#CD4945] bg-[#CD4945]/12 px-1.5 py-0.5 rounded">
                Overdue
              </span>
            )}
            {task.dueDate && !isOverdue && (
              <span className="text-[11px] text-[#6B6B6B]">
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
