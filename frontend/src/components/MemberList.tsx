import { useState } from 'react';
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

  async function handleAdd() {
    setError('');
    try {
      const res = await membersApi.addMember(projectId, { email, role: 'MEMBER' });
      onMembersChange([...members, res.data.member]);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to add member');
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
      <h3 className="font-semibold text-gray-700 mb-3">Members</h3>
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <ul className="space-y-2 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-gray-800">{m.user.name}</p>
              <p className="text-gray-500 text-xs">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {m.role}
              </span>
              {isAdmin && (
                <button onClick={() => handleRemove(m.userId)}
                  className="text-red-500 hover:text-red-700 text-xs">Remove</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <div className="flex gap-2">
          <input
            placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button onClick={handleAdd}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700">
            Add
          </button>
        </div>
      )}
    </div>
  );
}
