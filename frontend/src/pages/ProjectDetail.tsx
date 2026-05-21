import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
      <div className="min-h-screen bg-[#111111]">
        <div className="px-8 py-5 border-b border-[#2A2A2A] h-16 animate-pulse bg-[#1A1A1A]" />
        <div className="px-8 py-6 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-[#1A1A1A] rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-zinc-500">Project not found.</p>
      </div>
    );
  }

  const headerAction = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowMembers(!showMembers)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border ${
          showMembers
            ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
            : 'border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 hover:bg-[#222222]'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        Members ({project.members.length})
      </button>
      {isAdmin && (
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader
        title={project.name}
        breadcrumb="Projects"
        action={headerAction}
      />

      <div className="flex gap-0">
        {/* Kanban board */}
        <div className={`flex-1 px-8 py-6 transition-all ${showMembers ? 'pr-4' : ''}`}>
          <div className="grid grid-cols-3 gap-4 h-full">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-medium text-zinc-400">{col.label}</h3>
                    <span className="bg-[#222222] text-zinc-500 text-xs font-mono px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2 flex-1">
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} projectId={project.id} />
                    ))}
                  </div>

                  {/* Add task shortcut (TODO column, ADMIN only) */}
                  {col.key === 'TODO' && isAdmin && (
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="mt-2 flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-600 hover:text-zinc-400 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add task
                    </button>
                  )}

                  {/* Empty column hint */}
                  {colTasks.length === 0 && !(col.key === 'TODO' && isAdmin) && (
                    <div className="border border-dashed border-[#2A2A2A] rounded-lg py-8 text-center">
                      <p className="text-xs text-zinc-700">No tasks</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Members panel */}
        {showMembers && (
          <div className="w-72 border-l border-[#2A2A2A] px-6 py-6 shrink-0">
            <MemberList
              members={project.members}
              projectId={project.id}
              isAdmin={isAdmin ?? false}
              onMembersChange={(updated) =>
                setProject((p) => (p ? { ...p, members: updated } : p))
              }
            />
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-[#F5F5F5] font-semibold mb-5">New Task</h2>
            <TaskForm
              members={project.members}
              onSubmit={handleCreateTask}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
