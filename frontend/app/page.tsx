'use client';

import { useState } from 'react';
import ProductInput from '@/components/ProductInput';
import DebateView from '@/components/DebateView';
import JudgeGauge from '@/components/JudgeGauge';
import InputForm from '@/components/InputForm';
import { DebateTurn } from '@/types/debate';
import { startDebate, getNextTurn } from '@/lib/api';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<DebateTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartDebate = async (productUrl: string, userQuery: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await startDebate({ product_url: productUrl, user_query: userQuery });
      setSessionId(response.session_id);
      setTurns([response.turn]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '議論の開始に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextTurn = async (intervention?: string) => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getNextTurn({
        session_id: sessionId,
        user_intervention: intervention,
      });
      setTurns([...turns, response.turn]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '次のターンの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const currentScore = turns.length > 0 ? turns[turns.length - 1].judge.score : 50;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Shopping Colosseum
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            AIエージェントがあなたの買い物を徹底議論
          </p>
        </div>

        {/* 商品入力フォーム */}
        {!sessionId && (
          <ProductInput onSubmit={handleStartDebate} isLoading={isLoading} />
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 議論が開始されている場合 */}
        {sessionId && (
          <div className="space-y-6">
            {/* 購入推奨ゲージ */}
            <JudgeGauge score={currentScore} />

            {/* 議論ビュー */}
            <DebateView turns={turns} isLoading={isLoading} />

            {/* ユーザー介入フォーム */}
            {!isLoading && (
              <InputForm onSubmit={handleNextTurn} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
