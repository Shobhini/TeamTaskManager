import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
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

function SkeletonRow() {
  return (
    <tr className="border-t border-white/[0.06]">
      <td className="px-4 py-3"><div className="h-4 bg-[#373C3F] rounded animate-pulse w-3/4" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-[#373C3F] rounded animate-pulse w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-[#373C3F] rounded animate-pulse w-20" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-[#373C3F] rounded animate-pulse w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-[#373C3F] rounded animate-pulse w-20" /></td>
    </tr>
  );
}

function MobileTaskCard({ task, index }: { task: DashboardTask; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={() => navigate(`/projects/${task.project.id}/tasks/${task.id}`)}
      className={`bg-[#2F3437] border border-white/10 rounded-xl p-4 cursor-pointer active:bg-[#373C3F] ${
        task.overdue ? 'border-l-2 border-l-[#CD4945]' : ''
      }`}
    >
      <p className="text-[14px] font-medium text-[#D4D4D4] mb-1.5">{task.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          to={`/projects/${task.project.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] text-[#9B9B9B] hover:text-[#D4D4D4] transition-colors"
        >
          {task.project.name}
        </Link>
        <span className="text-[#454B4E]">·</span>
        <Badge type="status" value={task.status} />
      </div>
      {(task.dueDate || task.priority !== 'LOW') && (
        <div className="flex items-center gap-2 mt-1.5">
          <Badge type="priority" value={task.priority} />
          {task.dueDate && (
            <span className={`text-[11px] ${task.overdue ? 'text-[#CD4945]' : 'text-[#6B6B6B]'}`}>
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {task.overdue && ' · Overdue'}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader title="My Tasks" />

      <div className="px-6 pt-5 pb-1 flex items-center gap-2 flex-wrap">
        <span className="bg-[#2F3437] border border-white/[0.08] rounded-full px-3 py-1 text-xs text-[#9B9B9B]">
          <span className="text-[#D4D4D4] font-medium">{summary.total}</span> total
        </span>
        <span className="bg-[#2F3437] border border-white/[0.08] rounded-full px-3 py-1 text-xs text-[#9B9B9B]">
          <span className="text-[#447ACB] font-medium">{summary.inProgress}</span> in progress
        </span>
        {summary.overdue > 0 && (
          <span className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-full px-3 py-1 text-xs">
            <span className="text-[#CD4945] font-medium">{summary.overdue}</span>
            <span className="text-[#CD4945]/70"> overdue</span>
          </span>
        )}
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block bg-[#2F3437] border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-[#2F3437] rounded-xl animate-pulse" />
              ))}
            </div>
          </>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            heading="No tasks assigned to you"
            subtext="Tasks assigned to you across all projects will appear here"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[#2F3437] border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {tasks.map((task, index) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => navigate(`/projects/${task.project.id}/tasks/${task.id}`)}
                        className={`border-t border-white/[0.06] hover:bg-[#373C3F] transition-colors cursor-pointer ${
                          task.overdue ? 'border-l-2 border-l-[#CD4945]' : ''
                        }`}
                      >
                        <td className="px-4 py-3 w-[40%]">
                          <span className="text-[#D4D4D4] hover:text-white font-medium transition-colors">
                            {task.title}
                          </span>
                        </td>
                        <td className="px-4 py-3 w-[20%]">
                          <Link
                            to={`/projects/${task.project.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#9B9B9B] hover:text-[#D4D4D4] transition-colors"
                          >
                            {task.project.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 w-[15%]">
                          <Badge type="status" value={task.status} />
                        </td>
                        <td className="px-4 py-3 w-[12%]">
                          <Badge type="priority" value={task.priority} />
                        </td>
                        <td className="px-4 py-3 w-[13%] text-[#6B6B6B] text-xs">
                          {task.dueDate ? (
                            <span className={task.overdue ? 'text-[#CD4945] font-medium' : ''}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {task.overdue && ' · Overdue'}
                            </span>
                          ) : (
                            <span className="text-[#454B4E]">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
              {tasks.map((task, index) => (
                <MobileTaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
