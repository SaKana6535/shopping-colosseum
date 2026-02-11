'use client';

import Link from 'next/link';

interface HeaderProps {
  onToggleLogs: () => void;
  sidebarOpen: boolean;
}

export default function Header({ onToggleLogs, sidebarOpen }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hover:opacity-90 transition-opacity"
          >
            Shopping Colosseum
          </Link>
          <nav>
            <button
              type="button"
              onClick={onToggleLogs}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sidebarOpen
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              議論ログ
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
