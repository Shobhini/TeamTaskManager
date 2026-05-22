import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebarToggle } from './AppShell';
import Avatar from './Avatar';

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, breadcrumb, action }: PageHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const openSidebar = useSidebarToggle();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 h-12 bg-[#191919]/80 backdrop-blur-md border-b border-white/[0.08] flex items-center px-6 gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={openSidebar}
        className="lg:hidden text-[#9B9B9B] hover:text-[#D4D4D4] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb + Title */}
      <div className="flex-1 min-w-0">
        {breadcrumb ? (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#6B6B6B] truncate">{breadcrumb}</span>
            <span className="text-[#454B4E]">/</span>
            <span className="text-[#D4D4D4] font-medium truncate">{title}</span>
          </div>
        ) : (
          <span className="text-[#D4D4D4] font-medium text-sm">{title}</span>
        )}
      </div>

      {/* Action slot */}
      {action && <div className="shrink-0">{action}</div>}

      {/* Right icons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#2F3437] transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2F3437] transition-colors"
          >
            <Avatar name={user?.email ?? 'U'} size="sm" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 w-52 bg-[#2F3437] border border-white/[0.12] rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-white/[0.08]">
                <p className="text-[12px] text-[#9B9B9B] truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#D4D4D4] hover:bg-[#3F4448] transition-colors"
              >
                <LogOut size={14} className="text-[#6B6B6B]" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
