import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const;

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

const inputClass = 'w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-blue-500 transition-colors';

export default function TaskDetail() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const myMembership = members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id || !taskId) return;
    Promise.all([tasksApi.getTask(id, taskId), projectsApi.getProject(id)])
      .then(([taskRes, projRes]) => {
        const t = taskRes.data.task;
        setTask(t);
        setMembers(projRes.data.project.members);
        setProjectName(projRes.data.project.name);
        setTitle(t.title);
        setDescription(t.description ?? '');
        setStatus(t.status);
        setPriority(t.priority);
        setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
        setAssigneeId(t.assignee?.id ?? '');
      })
      .finally(() => setLoading(false));
  }, [id, taskId]);

  async function saveField(field: object) {
    setSaving(true);
    setError('');
    try {
      const res = await tasksApi.updateTask(id!, taskId!, field);
      setTask(res.data.task);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await tasksApi.deleteTask(id!, taskId!);
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to delete');
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111]">
        <div className="h-16 border-b border-[#2A2A2A] animate-pulse bg-[#1A1A1A]" />
        <div className="px-8 py-6 grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="h-8 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-32 bg-[#1A1A1A] rounded animate-pulse" />
          </div>
          <div className="h-64 bg-[#1A1A1A] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-zinc-500">Task not found.</p>
      </div>
    );
  }

  const breadcrumb = `Projects / ${projectName}`;

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader
        title={task.title}
        breadcrumb={breadcrumb}
        action={
          isAdmin ? (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mx-8 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="px-8 py-6 grid grid-cols-3 gap-8">
        {/* Left: Title + Description */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div>
            {editingTitle && isAdmin ? (
              <div className="flex gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-blue-500 rounded-lg px-3 py-2 text-lg font-semibold text-[#F5F5F5] focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => { saveField({ title }); setEditingTitle(false); }}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { setTitle(task.title); setEditingTitle(false); }}
                  className="px-3 py-2 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h2
                className={`text-xl font-semibold text-[#F5F5F5] ${isAdmin ? 'cursor-pointer hover:text-blue-400' : ''} transition-colors`}
                onClick={() => isAdmin && setEditingTitle(true)}
                title={isAdmin ? 'Click to edit' : undefined}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Description</p>
            {editingDescription && isAdmin ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Add a description..."
                  className="w-full bg-[#1A1A1A] border border-blue-500 rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { saveField({ description }); setEditingDescription(false); }}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setDescription(task.description ?? ''); setEditingDescription(false); }}
                    className="px-3 py-1.5 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`min-h-[80px] p-3 rounded-lg border ${
                  isAdmin
                    ? 'border-[#2A2A2A] hover:border-zinc-600 cursor-pointer'
                    : 'border-transparent'
                } transition-colors`}
                onClick={() => isAdmin && setEditingDescription(true)}
              >
                {task.description ? (
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-zinc-700">{isAdmin ? 'Click to add description...' : 'No description'}</p>
                )}
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="pt-4 border-t border-[#2A2A2A]">
            <p className="text-xs text-zinc-600">
              Created by{' '}
              <span className="text-zinc-400">{task.createdBy?.name}</span>
            </p>
          </div>
        </div>

        {/* Right: Metadata sidebar */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 h-fit space-y-5">
          {/* Status */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Status</p>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); saveField({ status: e.target.value }); }}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Priority — admin only editable */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Priority {!isAdmin && <span className="text-zinc-700">🔒</span>}
            </p>
            {isAdmin ? (
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); saveField({ priority: e.target.value }); }}
                className={inputClass}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2">
                <Badge type="priority" value={task.priority} />
              </div>
            )}
          </div>

          {/* Assignee — admin only editable */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Assignee {!isAdmin && <span className="text-zinc-700">🔒</span>}
            </p>
            {isAdmin ? (
              <select
                value={assigneeId}
                onChange={(e) => { setAssigneeId(e.target.value); saveField({ assigneeId: e.target.value || null }); }}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <Avatar name={task.assignee.name} size="sm" />
                    <span className="text-sm text-zinc-300">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-zinc-600">Unassigned</span>
                )}
              </div>
            )}
          </div>

          {/* Due Date — admin only editable */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Due Date {!isAdmin && <span className="text-zinc-700">🔒</span>}
            </p>
            {isAdmin ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); saveField({ dueDate: e.target.value || undefined }); }}
                className={inputClass}
              />
            ) : (
              <div className="px-3 py-2">
                <span className="text-sm text-zinc-300">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : <span className="text-zinc-600">Not set</span>
                  }
                </span>
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="pt-2 border-t border-[#2A2A2A]">
            <Link
              to={`/projects/${id}`}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to {projectName}
            </Link>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete task"
          message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
          confirmLabel="Delete task"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
