import { useState } from 'react';
import Avatar from './Avatar';
import * as membersApi from '../api/members';

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface Props {
  members: Member[];
  projectId: string;
  isAdmin: boolean;
  onMembersChange: (members: Member[]) => void;
}

export default function MemberList({ members, projectId, isAdmin, onMembersChange }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!email.trim()) return;
    setError('');
    setAdding(true);
    try {
      const res = await membersApi.addMember(projectId, { email: email.trim(), role: 'MEMBER' });
      onMembersChange([...members, res.data.member]);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to add member');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(userId: string) {
    try {
      await membersApi.removeMember(projectId, userId);
      onMembersChange(members.filter((m) => m.userId !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to remove member');
    }
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Members ({members.length})
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 mb-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <ul className="space-y-2 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2.5 group">
            <Avatar name={m.user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{m.user.name}</p>
              <p className="text-xs text-zinc-600 truncate">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                  m.role === 'ADMIN'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {m.role}
              </span>
              {isAdmin && (
                <button
                  onClick={() => handleRemove(m.userId)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                  title="Remove member"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            className="flex-1 bg-[#111111] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !email.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}
