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

const inputClass = 'w-full bg-[#373C3F] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors';
const labelClass = 'block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5';

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
        <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-2">
          <p className="text-[#CD4945] text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className={labelClass}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="What needs to be done?"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description <span className="normal-case text-[#454B4E] font-normal">optional</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Add more context..."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Due date <span className="normal-case text-[#454B4E] font-normal">optional</span></label>
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
        <label className={labelClass}>Assignee <span className="normal-case text-[#454B4E] font-normal">optional</span></label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-[#6B6B6B] hover:text-[#D4D4D4] py-2 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
