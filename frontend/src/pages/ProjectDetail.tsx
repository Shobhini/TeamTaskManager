import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import MemberList from '../components/MemberList';
import { useAuth } from '../context/AuthContext';
import * as projectsApi from '../api/projects';
import * as tasksApi from '../api/tasks';

const COLUMNS = [
  { key: 'TODO', label: 'Todo' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
] as const;

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  members: Member[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openColumn, setOpenColumn] = useState<string>('TODO');

  const myMembership = project?.members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id) return;
    Promise.all([projectsApi.getProject(id), tasksApi.listTasks(id)])
      .then(([projRes, tasksRes]) => {
        setProject(projRes.data.project);
        setTasks(tasksRes.data.tasks);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCreateTask(data: {
    title: string; description: string; priority: string; dueDate: string; assigneeId: string;
  }) {
    const res = await tasksApi.createTask(id!, {
      ...data,
      dueDate: data.dueDate || undefined,
      assigneeId: data.assigneeId || undefined,
    });
    setTasks((prev) => [...prev, res.data.task]);
    setShowTaskForm(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191919]">
        <div className="h-12 border-b border-white/[0.08] animate-pulse bg-[#2F3437]" />
        <div className="px-6 py-6 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-[#2F3437] rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <p className="text-[#6B6B6B]">Project not found.</p>
      </div>
    );
  }

  const headerAction = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setShowMembers(!showMembers)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border ${
          showMembers
            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
            : 'border-white/[0.08] text-[#9B9B9B] hover:text-[#D4D4D4] hover:bg-[#2F3437]'
        }`}
      >
        <Users size={14} />
        <span className="hidden sm:inline">Members ({project.members.length})</span>
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader
        title={project.name}
        breadcrumb="Projects"
        action={headerAction}
      />

      <div className="flex gap-0 min-h-[calc(100vh-48px)]">
        {/* Kanban board */}
        <div className={`flex-1 px-6 py-6 min-w-0 transition-all ${showMembers ? 'lg:pr-4' : ''}`}>

          {/* Desktop: 3-column flex */}
          <div className="hidden md:flex gap-4 h-full">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-semibold text-[#D4D4D4]">{col.label}</h3>
                    <span className="bg-[#454B4E] text-[#9B9B9B] text-xs px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 bg-[#2F3437]/40 border border-white/[0.06] rounded-xl p-2 min-h-[400px] overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {colTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <TaskCard task={task} projectId={project.id} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {colTasks.length === 0 && !(col.key === 'TODO' && isAdmin) && (
                      <div className="flex items-center justify-center h-24">
                        <p className="text-xs text-[#454B4E]">No tasks</p>
                      </div>
                    )}

                    {col.key === 'TODO' && isAdmin && (
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(true)}
                        className="mt-2 flex items-center gap-1.5 w-full px-2 py-2 text-xs text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] rounded-lg transition-colors"
                      >
                        <Plus size={12} />
                        Add task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: accordion columns */}
          <div className="md:hidden space-y-3">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              const isOpen = openColumn === col.key;
              return (
                <div key={col.key} className="bg-[#2F3437]/40 border border-white/[0.06] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenColumn(isOpen ? '' : col.key)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-[#D4D4D4]">{col.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#454B4E] text-[#9B9B9B] text-xs px-2 py-0.5 rounded-full">
                        {colTasks.length}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[#6B6B6B] text-xs"
                      >
                        ›
                      </motion.span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2">
                          {colTasks.map((task) => (
                            <TaskCard key={task.id} task={task} projectId={project.id} />
                          ))}
                          {colTasks.length === 0 && (
                            <p className="text-xs text-[#454B4E] text-center py-4">No tasks</p>
                          )}
                          {col.key === 'TODO' && isAdmin && (
                            <button
                              type="button"
                              onClick={() => setShowTaskForm(true)}
                              className="flex items-center gap-1.5 w-full px-2 py-2 text-xs text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] rounded-lg transition-colors"
                            >
                              <Plus size={12} />
                              Add task
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Members panel */}
        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-white/[0.08] shrink-0 overflow-hidden"
            >
              <div className="w-72 px-5 py-5">
                <MemberList
                  members={project.members}
                  projectId={project.id}
                  isAdmin={isAdmin ?? false}
                  onMembersChange={(updated) =>
                    setProject((p) => (p ? { ...p, members: updated } : p))
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setShowTaskForm(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-[#2F3437] border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold">New Task</h2>
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="text-[#6B6B6B] hover:text-[#D4D4D4] transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>
                <TaskForm
                  members={project.members}
                  onSubmit={handleCreateTask}
                  onCancel={() => setShowTaskForm(false)}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
