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
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
        <label className="block text-sm font-medium text-gray-700">Assign To</label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm disabled:opacity-50">
          {loading ? 'Saving...' : 'Create Task'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
