import { useState } from 'react';
import { X } from 'lucide-react';
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
      <h3 className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-3">
        Members ({members.length})
      </h3>

      {error && (
        <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-1.5 mb-3">
          <p className="text-[#CD4945] text-xs">{error}</p>
        </div>
      )}

      <ul className="space-y-1 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2.5 py-1 group">
            <Avatar name={m.user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#D4D4D4] truncate">{m.user.name}</p>
              <p className="text-[11px] text-[#6B6B6B] truncate">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  m.role === 'ADMIN'
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'bg-white/8 text-[#6B6B6B]'
                }`}
              >
                {m.role}
              </span>
              {isAdmin && (
                <button
                  onClick={() => handleRemove(m.userId)}
                  className="opacity-0 group-hover:opacity-100 text-[#6B6B6B] hover:text-[#CD4945] transition-all"
                  title="Remove member"
                >
                  <X size={14} />
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
            className="flex-1 bg-[#373C3F] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !email.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}
