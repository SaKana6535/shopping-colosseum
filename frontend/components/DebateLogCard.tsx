'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { DebateLogSummary } from '@/types/debate';

interface DebateLogCardProps {
  log: DebateLogSummary;
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

export default function DebateLogCard({ log }: DebateLogCardProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = pathname === '/debate' && searchParams.get('id') === log.session_id;
  const title = getDisplayTitle(log);
  const dateStr = formatDate(log.created_at);

  return (
    <Link
      href={`/debate?id=${log.session_id}`}
      className={`block w-full text-left px-4 py-3 rounded-xl transition-colors group ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* チャットアイコン */}
        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
          isActive
            ? 'bg-gradient-to-br from-blue-600 to-purple-700'
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }`}>
          💬
        </div>

        {/* タイトルと日時 */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium line-clamp-2 leading-snug transition-colors ${
            isActive
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
          }`}>
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
            {log.debate_mode && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                log.debate_mode === 'discussion'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {log.debate_mode === 'discussion' ? 'ディスカッション' : 'レビュー'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
