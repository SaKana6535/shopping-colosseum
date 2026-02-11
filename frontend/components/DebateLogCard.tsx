'use client';

import { DebateLogSummary } from '@/types/debate';

interface DebateLogCardProps {
  log: DebateLogSummary;
  onSelect: (sessionId: string) => void;
}

function formatDate(value?: string): string {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) {
      return new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

function getDisplayTitle(log: DebateLogSummary): string {
  return log.title?.trim() || log.user_query?.trim() || '新しい議論';
}

export default function DebateLogCard({ log, onSelect }: DebateLogCardProps) {
  const title = getDisplayTitle(log);
  const dateStr = formatDate(log.created_at);

  return (
    <button
      type="button"
      onClick={() => onSelect(log.session_id)}
      className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* チャットアイコン */}
        <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          💬
        </div>

        {/* タイトルと日時 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {dateStr && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {dateStr}
              </span>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ターン {log.current_turn}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
