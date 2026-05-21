import { useState } from 'react';
import type { FormEvent } from 'react';

interface Member {
  userId: string;
  user: { id: string; name: string };
}

interface TaskFormData {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
}

interface Props {
  members: Member[];
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const inputClass = 'w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-xs font-medium text-zinc-400 mb-1.5';

const today = new Date().toISOString().split('T')[0];

export default function TaskForm({ members, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ title, description, priority, dueDate, assigneeId });
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <div>
        <label className={labelClass}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Task title"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Description <span className="text-zinc-600">(optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Add details..."
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={inputClass}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Due date <span className="text-zinc-600">(optional)</span></label>
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Assign to <span className="text-zinc-600">(optional)</span></label>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className={inputClass}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 hover:bg-[#222222] py-2 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
