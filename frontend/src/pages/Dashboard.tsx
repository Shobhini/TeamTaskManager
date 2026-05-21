import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h1>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'My Tasks', value: summary.total, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'In Progress', value: summary.inProgress, color: 'bg-blue-50 text-blue-700' },
            { label: 'Overdue', value: summary.overdue, color: 'bg-red-50 text-red-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-lg p-4 ${color}`}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tasks Table */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned to you.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  {['Title', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className={`border-t ${task.overdue ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${task.project.id}/tasks/${task.id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link to={`/projects/${task.project.id}`} className="hover:underline">
                        {task.project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${task.priority === 'HIGH' ? 'text-red-600' : task.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      {task.overdue && <span className="ml-2 text-red-500 text-xs font-semibold">OVERDUE</span>}
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
