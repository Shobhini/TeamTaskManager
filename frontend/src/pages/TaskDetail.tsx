import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Lock } from 'lucide-react';
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
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
}

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

const selectClass = 'w-full bg-[#373C3F] border-none rounded-lg px-3 py-2 text-sm text-[#D4D4D4] focus:outline-none focus:ring-1 focus:ring-[#447ACB] transition-colors';
const sectionLabel = 'text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-2';

export default function TaskDetail() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | ''>('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | ''>('');
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
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [id, taskId]);

  async function saveField(field: object) {
    setSaving(true);
    setError('');
    try {
      const res = await tasksApi.updateTask(id!, taskId!, field);
      setTask(res.data.task);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await tasksApi.deleteTask(id!, taskId!);
      navigate(`/projects/${id}`);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to delete');
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191919]">
        <div className="h-12 border-b border-white/[0.08] animate-pulse bg-[#2F3437]" />
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[#2F3437] rounded-lg animate-pulse" />
            <div className="h-32 bg-[#2F3437] rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-[#2F3437] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <p className="text-[#CD4945]">Failed to load task. Please refresh the page.</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <p className="text-[#6B6B6B]">Task not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader
        title={task.title}
        breadcrumb={projectName}
        action={
          isAdmin ? (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#CD4945] hover:text-red-300 border border-[#CD4945]/20 hover:border-[#CD4945]/40 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mx-6 mt-4 bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-4 py-2">
          <p className="text-[#CD4945] text-sm">{error}</p>
        </div>
      )}

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Title + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Back link */}
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#D4D4D4] text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            {projectName}
          </Link>

          {/* Title */}
          <div>
            {editingTitle && isAdmin ? (
              <div className="flex gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 bg-[#2F3437] border border-[#447ACB] rounded-lg px-3 py-2 text-2xl font-semibold text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { saveField({ title }); setEditingTitle(false); }}
                  disabled={saving}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setTitle(task.title); setEditingTitle(false); }}
                  className="px-3 py-2 border border-white/[0.08] text-[#9B9B9B] hover:text-[#D4D4D4] rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h2
                className={`text-2xl font-semibold text-white ${isAdmin ? 'cursor-pointer hover:text-[#D4D4D4]' : ''} transition-colors`}
                onClick={() => isAdmin && setEditingTitle(true)}
                onKeyDown={(e) => isAdmin && (e.key === 'Enter' || e.key === ' ') && setEditingTitle(true)}
                role={isAdmin ? 'button' : undefined}
                tabIndex={isAdmin ? 0 : undefined}
                title={isAdmin ? 'Click to edit' : undefined}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Description */}
          <div>
            <p className={sectionLabel}>Description</p>
            {editingDescription && isAdmin ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Add a description..."
                  className="w-full bg-[#2F3437] border border-[#447ACB] rounded-xl px-4 py-3 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { saveField({ description }); setEditingDescription(false); }}
                    disabled={saving}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDescription(task.description ?? ''); setEditingDescription(false); }}
                    className="px-3 py-1.5 border border-white/[0.08] text-[#9B9B9B] hover:text-[#D4D4D4] rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`bg-[#2F3437] rounded-xl p-4 min-h-[120px] ${
                  isAdmin ? 'cursor-pointer hover:bg-[#373C3F]' : ''
                } transition-colors`}
                onClick={() => isAdmin && setEditingDescription(true)}
                onKeyDown={(e) => isAdmin && (e.key === 'Enter' || e.key === ' ') && setEditingDescription(true)}
                role={isAdmin ? 'button' : undefined}
                tabIndex={isAdmin ? 0 : undefined}
              >
                {task.description ? (
                  <p className="text-sm text-[#D4D4D4] whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-[#454B4E]">
                    {isAdmin ? 'Click to add description...' : 'No description'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-[12px] text-[#454B4E]">
              Created by <span className="text-[#6B6B6B]">{task.createdBy?.name}</span>
            </p>
          </div>
        </div>

        {/* Right: Metadata sidebar */}
        <div className="bg-[#2F3437] border border-white/10 rounded-xl p-5 h-fit">
          {/* Status */}
          <div className="py-3 border-b border-white/[0.06]">
            <p className={sectionLabel}>Status</p>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE'); saveField({ status: e.target.value }); }}
              disabled={saving}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="py-3 border-b border-white/[0.06]">
            <p className={sectionLabel}>
              Priority {!isAdmin && <Lock size={10} className="inline ml-1 text-[#454B4E]" />}
            </p>
            {isAdmin ? (
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH'); saveField({ priority: e.target.value }); }}
                disabled={saving}
                className={selectClass}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            ) : (
              <div className="px-1 py-1">
                <Badge type="priority" value={task.priority} />
              </div>
            )}
          </div>

          {/* Assignee */}
          <div className="py-3 border-b border-white/[0.06]">
            <p className={sectionLabel}>
              Assignee {!isAdmin && <Lock size={10} className="inline ml-1 text-[#454B4E]" />}
            </p>
            {isAdmin ? (
              <select
                value={assigneeId}
                onChange={(e) => { setAssigneeId(e.target.value); saveField({ assigneeId: e.target.value || null }); }}
                disabled={saving}
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            ) : (
              <div className="px-1 py-1 flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <Avatar name={task.assignee.name} size="sm" />
                    <span className="text-sm text-[#D4D4D4]">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-[#454B4E]">Unassigned</span>
                )}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="py-3">
            <p className={sectionLabel}>
              Due Date {!isAdmin && <Lock size={10} className="inline ml-1 text-[#454B4E]" />}
            </p>
            {isAdmin ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); saveField({ dueDate: e.target.value || undefined }); }}
                disabled={saving}
                className={selectClass}
              />
            ) : (
              <div className="px-1 py-1">
                <span className="text-sm text-[#D4D4D4]">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : <span className="text-[#454B4E]">Not set</span>
                  }
                </span>
              </div>
            )}
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
    </motion.div>
  );
}
