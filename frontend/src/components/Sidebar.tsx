import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../api/projects';
import Avatar from './Avatar';

interface Project {
  id: string;
  name: string;
  role: string;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    listProjects()
      .then((res) => setProjects(res.data.projects))
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-500/15 text-blue-400 font-medium'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#222222]'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0A0A0A] border-r border-[#2A2A2A] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#2A2A2A]">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">TT</span>
          </div>
          <span className="text-[#F5F5F5] font-semibold text-sm">TeamTask</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-1">
        <NavLink to="/dashboard" className={navItemClass}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={navItemClass}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          Projects
        </NavLink>
      </nav>

      {/* Project list */}
      {projects.length > 0 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-2">
            My Projects
          </p>
          <div className="space-y-0.5">
            {projects.slice(0, 8).map((p) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1A1A1A]'
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span className="truncate">{p.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* User block */}
      <div className="mt-auto border-t border-[#2A2A2A] p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.email ?? 'U'} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-zinc-500 hover:text-red-400 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
