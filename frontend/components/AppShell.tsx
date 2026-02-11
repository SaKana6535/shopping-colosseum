'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from './Header';
import DebateLogSidebar from './DebateLogSidebar';
import DebateLogDetailView from './DebateLogDetailView';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('openLogs') === '1') {
      setSidebarOpen(true);
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSelectLog = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleCloseDetail = () => {
    setSelectedSessionId(null);
  };

  return (
    <div className="flex min-h-screen">
      <DebateLogSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectLog={handleSelectLog}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleLogs={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1">
          {selectedSessionId ? (
            <DebateLogDetailView
              sessionId={selectedSessionId}
              onClose={handleCloseDetail}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
