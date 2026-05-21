import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#111111]">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
