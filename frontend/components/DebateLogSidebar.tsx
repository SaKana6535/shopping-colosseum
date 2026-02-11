'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DebateLogCard from './DebateLogCard';
import { fetchDebateLogs } from '@/lib/api';
import { DebateLogSummary } from '@/types/debate';

interface DebateLogSidebarProps {
  isOpen: boolean;
}

export default function DebateLogSidebar({
  isOpen,
}: DebateLogSidebarProps) {
  const [logs, setLogs] = useState<DebateLogSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchDebateLogs(20, 0);
        setLogs(response.logs);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '読み込みに失敗しました';
        if (message === 'FIRESTORE_DISABLED') {
          setError('議論の閲覧にはFirestoreの設定が必要です');
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [isOpen]);

  return (
    <aside
      className={`h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden transition-all duration-300 ease-out ${
        isOpen ? 'w-80' : 'w-0 border-0'
      }`}
    >
      <div className="flex flex-col h-full w-80">
          {/* 新しい議論ボタン */}
          <div className="px-4 pt-4 pb-2 shrink-0">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新しい議論
            </Link>
          </div>

          {/* ヘッダー */}
          <div className="px-4 py-3 shrink-0">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              あなたの議論
            </h2>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-auto px-2 pb-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 dark:border-slate-700 border-t-blue-500" />
                <span className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  読み込み中...
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-6 text-center">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {!isLoading && !error && logs.length === 0 && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-8 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  まだ議論がありません
                </p>
              </div>
            )}

            {!isLoading && !error && logs.length > 0 && (
              <div className="space-y-0.5">
                {logs.map((log) => (
                  <DebateLogCard
                    key={log.session_id}
                    log={log}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
  );
}
