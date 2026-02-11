'use client';

import { useState, useEffect } from 'react';
import TurnHistorySidebar from './TurnHistorySidebar';
import CurrentTurnView from './CurrentTurnView';
import JudgeGauge from './JudgeGauge';
import { fetchDebateLogDetail } from '@/lib/api';
import { DebateLogDetail } from '@/types/debate';

interface DebateLogDetailModalProps {
  sessionId: string;
  onClose: () => void;
}

export default function DebateLogDetailModal({
  sessionId,
  onClose,
}: DebateLogDetailModalProps) {
  const [detail, setDetail] = useState<DebateLogDetail | null>(null);
  const [selectedTurnId, setSelectedTurnId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDebateLogDetail(sessionId);
        if (!cancelled) {
          setDetail(data);
          const lastTurnId =
            data.history.length > 0
              ? data.history[data.history.length - 1].turn_id
              : null;
          setSelectedTurnId(lastTurnId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '読み込みに失敗しました');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const displayTurn =
    detail && selectedTurnId
      ? detail.history.find((t) => t.turn_id === selectedTurnId) ||
        detail.history[detail.history.length - 1]
      : null;

  const currentScore =
    detail && detail.history.length > 0
      ? detail.history[detail.history.length - 1].judge.score
      : 50;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            議論ログ
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500" />
              <span className="mt-4 text-slate-600 dark:text-slate-400">
                読み込み中...
              </span>
            </div>
          )}

          {error && (
            <div className="py-12 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                閉じる
              </button>
            </div>
          )}

          {!isLoading && !error && detail && (
            <div className="space-y-4">
              {/* 商品情報 */}
              <div className="rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate flex-1">
                    {detail.product_url}
                  </p>
                  {detail.debate_mode && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                      detail.debate_mode === 'discussion'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}>
                      {detail.debate_mode === 'discussion' ? '💬 ディスカッション' : '📝 レビュー'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {detail.user_query || '（悩みなし）'}
                </p>
              </div>

              {/* 2カラム: 履歴 + ターム内容 */}
              <div className="grid grid-cols-12 gap-6" style={{ minHeight: '500px' }}>
                <div className="col-span-3">
                  <TurnHistorySidebar
                    turns={detail.history}
                    currentTurnId={selectedTurnId}
                    onSelectTurn={setSelectedTurnId}
                  />
                </div>
                <div className="col-span-9 space-y-4">
                  <JudgeGauge score={currentScore} />
                  {displayTurn && (
                    <CurrentTurnView turn={displayTurn} isLoading={false} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
