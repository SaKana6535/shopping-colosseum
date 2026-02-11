'use client';

import { useState, ReactNode } from 'react';
import Header from './Header';
import DebateLogSidebar from './DebateLogSidebar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen">
      <DebateLogSidebar
        isOpen={sidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleLogs={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
