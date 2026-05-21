import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { getDashboard } from '../api/dashboard';

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  overdue: boolean;
  project: { id: string; name: string };
}

interface Summary {
  total: number;
  inProgress: number;
  overdue: number;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, inProgress: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => {
        setTasks(res.data.tasks);
        setSummary(res.data.summary);
      })
      .finally(() => setLoading(false));
  }, []);

  const metaPills = (
    <div className="flex items-center gap-2">
      <span className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1 text-xs text-zinc-400">
        <span className="text-[#F5F5F5] font-medium">{summary.total}</span> total
      </span>
      <span className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1 text-xs text-zinc-400">
        <span className="text-blue-400 font-medium">{summary.inProgress}</span> in progress
      </span>
      {summary.overdue > 0 && (
        <span className="bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 text-xs">
          <span className="text-red-400 font-medium">{summary.overdue}</span>
          <span className="text-red-400/70"> overdue</span>
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader title="My Tasks" meta={metaPills} />

      <div className="px-8 py-6">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[#1A1A1A] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="✓"
            heading="No tasks assigned to you"
            subtext="Tasks assigned to you will appear here"
          />
        ) : (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`border-t border-[#2A2A2A] hover:bg-[#222222] transition-colors ${
                      task.overdue ? 'border-l-2 border-l-red-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${task.project.id}/tasks/${task.id}`}
                        className="text-[#F5F5F5] hover:text-blue-400 font-medium transition-colors"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${task.project.id}`}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {task.project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge type="status" value={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge type="priority" value={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {task.dueDate ? (
                        <span className={task.overdue ? 'text-red-400 font-medium' : ''}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {task.overdue && ' · Overdue'}
                        </span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
