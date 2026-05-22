import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, LogOut,
  ChevronLeft, ChevronRight, X, Circle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../api/projects';
import Avatar from './Avatar';

interface Project {
  id: string;
  name: string;
  role: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export default function Sidebar({ open, onClose, collapsed, onCollapsedChange }: SidebarProps) {
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

  const width = collapsed ? 48 : 224;

  const navItemBase = 'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors duration-150';
  const navItemActive = 'bg-[#454B4E] text-white';
  const navItemInactive = 'text-[#D4D4D4] hover:bg-[#3F4448]';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `${navItemBase} ${isActive ? navItemActive : navItemInactive}`;

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold">TT</span>
                </div>
                <span className="text-white font-semibold text-sm">TeamTask</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden w-6 h-6 flex items-center justify-center rounded text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 space-y-0.5 shrink-0">
        <NavLink to="/dashboard" className={navItemClass} title="Dashboard">
          <LayoutDashboard size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Dashboard
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
        <NavLink to="/projects" className={navItemClass} title="Projects">
          <FolderOpen size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Projects
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </nav>

      {/* Project list */}
      {!collapsed && projects.length > 0 && (
        <div className="px-2 mt-4 shrink-0">
          <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-widest px-2 mb-1">
            My Projects
          </p>
          <div className="space-y-0.5">
            {projects.slice(0, 8).map((p) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#454B4E] text-[#D4D4D4]'
                      : 'text-[#9B9B9B] hover:bg-[#3F4448] hover:text-[#D4D4D4]'
                  }`
                }
              >
                <Circle size={6} className="shrink-0 fill-current" />
                <span className="truncate">{p.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* User block */}
      <div className="mt-auto border-t border-white/[0.08] p-2 shrink-0">
        <div className="flex items-center gap-2 px-1 py-1">
          <Avatar name={user?.email ?? 'U'} size={collapsed ? 'sm' : 'md'} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-[12px] text-[#D4D4D4] truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                title="Sign out"
                className="text-[#6B6B6B] hover:text-[#CD4945] transition-colors shrink-0"
              >
                <LogOut size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#373C3F] border-r border-white/[0.08] z-40 overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -224 }}
            animate={{ x: 0 }}
            exit={{ x: -224 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ width: 224 }}
            className="flex lg:hidden flex-col fixed left-0 top-0 h-screen bg-[#373C3F] border-r border-white/[0.08] z-50 overflow-hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
