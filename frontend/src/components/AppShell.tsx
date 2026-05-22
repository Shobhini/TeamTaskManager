import type { ReactNode } from 'react';
import { useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';

// Context so PageHeader can trigger mobile sidebar open
export const SidebarToggleContext = createContext<() => void>(() => {});
export const useSidebarToggle = () => useContext(SidebarToggleContext);

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#191919]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main
        className={`flex-1 min-h-screen min-w-0 transition-[margin] duration-200 ${
          sidebarCollapsed ? 'lg:ml-12' : 'lg:ml-56'
        }`}
      >
        <SidebarToggleContext.Provider value={() => setSidebarOpen(true)}>
          {children}
        </SidebarToggleContext.Provider>
      </main>
    </div>
  );
}
