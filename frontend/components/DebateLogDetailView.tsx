'use client';

import { useState, useEffect } from 'react';
import TurnHistorySidebar from './TurnHistorySidebar';
import CurrentTurnView from './CurrentTurnView';
import JudgeGauge from './JudgeGauge';
import InputForm from './InputForm';
import { fetchDebateLogDetail, getNextTurn } from '@/lib/api';
import { DebateLogDetail } from '@/types/debate';

interface DebateLogDetailViewProps {
  sessionId: string;
  onClose: () => void;
}

export default function DebateLogDetailView({
  sessionId,
  onClose,
}: DebateLogDetailViewProps) {
  const [detail, setDetail] = useState<DebateLogDetail | null>(null);
  const [selectedTurnId, setSelectedTurnId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTurn, setIsAddingTurn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextTurn = async (intervention?: string) => {
    if (!detail) return;
    setIsAddingTurn(true);
    setError(null);
    try {
      const response = await getNextTurn({
        session_id: sessionId,
        user_intervention: intervention,
      });
      setDetail({
        ...detail,
        history: [...detail.history, response.turn],
        current_turn: detail.current_turn + 1,
      });
      setSelectedTurnId(response.turn.turn_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '次のターンの取得に失敗しました');
    } finally {
      setIsAddingTurn(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            過去の議論
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            閉じる
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500" />
            <span className="mt-4 text-slate-600 dark:text-slate-400">
              読み込み中...
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-6 py-8 text-center">
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mb-1">
                {detail.product_url}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {detail.user_query || '（悩みなし）'}
              </p>
            </div>

            {/* 2カラム: 履歴 + ターン内容 */}
            <div
              className="grid grid-cols-12 gap-6"
              style={{ minHeight: '500px' }}
            >
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
                  <CurrentTurnView
                    turn={displayTurn}
                    isLoading={false}
                  />
                )}
              </div>
            </div>

            {/* 続きから議論 */}
            <InputForm
              onSubmit={handleNextTurn}
              onEnd={onClose}
              currentTurn={detail.current_turn}
              maxTurns={10}
              isLoading={isAddingTurn}
            />
          </div>
        )}
      </div>
    </div>
  );
}
