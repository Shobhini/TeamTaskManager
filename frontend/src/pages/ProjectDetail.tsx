import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import MemberList from '../components/MemberList';
import { useAuth } from '../context/AuthContext';
import * as projectsApi from '../api/projects';
import * as tasksApi from '../api/tasks';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

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
  const [loading, setLoading] = useState(true);

  const myMembership = project?.members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectsApi.getProject(id),
      tasksApi.listTasks(id),
    ]).then(([projRes, tasksRes]) => {
      setProject(projRes.data.project);
      setTasks(tasksRes.data.tasks);
    }).finally(() => setLoading(false));
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

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Loading...</p></div>;
  if (!project) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Project not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            {project.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
            >
              + New Task
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Kanban Board */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <div key={col} className="bg-gray-100 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">{col.replace('_', ' ')}</h3>
                <div className="space-y-2">
                  {tasks.filter((t) => t.status === col).map((task) => (
                    <TaskCard key={task.id} task={task} projectId={project.id} />
                  ))}
                  {tasks.filter((t) => t.status === col).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Member Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow p-4 h-fit">
            <MemberList
              members={project.members}
              projectId={project.id}
              isAdmin={isAdmin ?? false}
              onMembersChange={(updated) => setProject((p) => p ? { ...p, members: updated } : p)}
            />
          </div>
        </div>

        {/* Create Task Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-bold mb-4">New Task</h2>
              <TaskForm
                members={project.members}
                onSubmit={handleCreateTask}
                onCancel={() => setShowTaskForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
