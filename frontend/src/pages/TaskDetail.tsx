import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'];

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
}

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export default function TaskDetail() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const myMembership = members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id || !taskId) return;
    Promise.all([
      tasksApi.getTask(id, taskId),
      projectsApi.getProject(id),
    ]).then(([taskRes, projRes]) => {
      const t = taskRes.data.task;
      setTask(t);
      setMembers(projRes.data.project.members);
      setTitle(t.title);
      setDescription(t.description ?? '');
      setStatus(t.status);
      setPriority(t.priority);
      setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
      setAssigneeId(t.assignee?.id ?? '');
    }).finally(() => setLoading(false));
  }, [id, taskId]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const payload = isAdmin
        ? { title, description, status, priority, dueDate: dueDate || undefined, assigneeId: assigneeId || null }
        : { status };
      const res = await tasksApi.updateTask(id!, taskId!, payload);
      setTask(res.data.task);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.deleteTask(id!, taskId!);
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to delete');
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Loading...</p></div>;
  if (!task) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Task not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(`/projects/${id}`)} className="text-sm text-indigo-600 hover:underline mb-4 block">
          ← Back to project
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {editing ? (
            <div className="space-y-4">
              {isAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select value={priority} onChange={(e) => setPriority(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assignee</label>
                    <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800">{task.title}</h1>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)}
                    className="text-sm text-indigo-600 hover:underline">Edit</button>
                  {isAdmin && (
                    <button onClick={handleDelete}
                      className="text-sm text-red-500 hover:underline">Delete</button>
                  )}
                </div>
              </div>
              {task.description && <p className="text-gray-600 text-sm mb-4">{task.description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Status: </span><StatusBadge status={task.status} /></div>
                <div><span className="text-gray-500">Priority: </span><span className="font-medium">{task.priority}</span></div>
                <div><span className="text-gray-500">Assigned to: </span><span>{task.assignee?.name ?? 'Unassigned'}</span></div>
                <div><span className="text-gray-500">Due: </span><span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</span></div>
                <div><span className="text-gray-500">Created by: </span><span>{task.createdBy?.name}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
