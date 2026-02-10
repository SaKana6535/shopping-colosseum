'use client';

import { useState } from 'react';
import ProductInput from '@/components/ProductInput';
import AgentSelector from '@/components/AgentSelector';
import CurrentTurnView from '@/components/CurrentTurnView';
import TurnHistorySidebar from '@/components/TurnHistorySidebar';
import JudgeGauge from '@/components/JudgeGauge';
import InputForm from '@/components/InputForm';
import { DebateTurn, AgentRole } from '@/types/debate';
import { startDebate, getNextTurn } from '@/lib/api';
import { DEFAULT_AGENTS } from '@/lib/agentConfigs';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<DebateTurn[]>([]);
  const [selectedTurnId, setSelectedTurnId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentRole[]>([...DEFAULT_AGENTS]);
  const [productUrl, setProductUrl] = useState('');
  const [userQuery, setUserQuery] = useState('');

  const handleStartDebate = async (productUrl: string, userQuery: string) => {
    setIsLoading(true);
    setError(null);
    setProductUrl(productUrl);
    setUserQuery(userQuery);
    
    try {
      const response = await startDebate(productUrl, userQuery, selectedAgents);
      setSessionId(response.session_id);
      setTurns([response.turn]);
      setSelectedTurnId(response.turn.turn_id);
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
      const newTurns = [...turns, response.turn];
      setTurns(newTurns);
      setSelectedTurnId(response.turn.turn_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '次のターンの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndDebate = () => {
    // 議論終了時の処理（必要に応じてバックエンドに通知）
    alert('議論が終了しました。最終的な購入推奨度: ' + currentScore + '%');
    handleReset();
  };

  const handleReset = () => {
    setSessionId(null);
    setTurns([]);
    setSelectedTurnId(null);
    setError(null);
    setSelectedAgents([...DEFAULT_AGENTS]);
    setProductUrl('');
    setUserQuery('');
  };

  const currentScore = turns.length > 0 ? turns[turns.length - 1].judge.score : 50;
  const displayTurn = selectedTurnId 
    ? turns.find(t => t.turn_id === selectedTurnId) || turns[turns.length - 1]
    : turns[turns.length - 1];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ヘッダー（議論開始前のみ表示） */}
        {!sessionId && (
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                <h1 className="text-5xl font-black mb-3 tracking-tight">
                  Shopping Colosseum
                </h1>
              </div>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
              🎭 10種類のAIエージェントから選んで、あなたの買い物を徹底的に議論
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <span>論理</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">❤️</span>
                <span>感情</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>リスク</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span>コスパ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <span>エコ</span>
              </div>
              <div className="flex items-center gap-2">
                <span>他5種類...</span>
              </div>
            </div>
          </div>
        )}

        {/* 議論開始前: 商品入力とエージェント選択 */}
        {!sessionId && (
          <div className="grid grid-cols-10 gap-6 mb-6">
            {/* 左: エージェント選択 (40%) */}
            <div className="col-span-4">
              <AgentSelector
                selectedAgents={selectedAgents}
                onAgentsChange={setSelectedAgents}
              />
            </div>

            {/* 右: 商品入力フォーム (30%) */}
            <div className="col-span-6">
              <ProductInput
                onSubmit={handleStartDebate}
                isLoading={isLoading}
                isDebating={!!sessionId}
                onReset={handleReset}
                productUrl={productUrl}
                userQuery={userQuery}
                onProductUrlChange={setProductUrl}
                onUserQueryChange={setUserQuery}
              />
            </div>
          </div>
        )}

        {/* 議論中: タイトルと商品入力を2カラム */}
        {sessionId && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* 左: タイトル */}
            <div className="flex items-center h-full">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  Shopping Colosseum
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  🎭 AIエージェントが徹底議論中
                </p>
              </div>
            </div>
            
            {/* 右: 商品情報 */}
            <div className="h-full">
              <ProductInput
                onSubmit={handleStartDebate}
                isLoading={isLoading}
                isDebating={!!sessionId}
                onReset={handleReset}
                productUrl={productUrl}
                userQuery={userQuery}
                onProductUrlChange={setProductUrl}
                onUserQueryChange={setUserQuery}
              />
            </div>
          </div>
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
            {/* 2カラムレイアウト: 左に履歴、右に現在のターン */}
            <div className="grid grid-cols-12 gap-6" style={{ minHeight: '600px' }}>
              {/* 左サイドバー: 履歴 */}
              <div className="col-span-3">
                <TurnHistorySidebar 
                  turns={turns}
                  currentTurnId={selectedTurnId}
                  onSelectTurn={setSelectedTurnId}
                  isLoading={isLoading}
                />
              </div>

              {/* 右メインエリア: 現在のターンと推奨度 */}
              <div className="col-span-9 space-y-4">
                {/* 購入推奨ゲージ - 右上に配置 */}
                <JudgeGauge score={currentScore} />
                
                {displayTurn && (
                  <CurrentTurnView 
                    turn={displayTurn}
                    isLoading={isLoading && selectedTurnId === turns[turns.length - 1]?.turn_id}
                  />
                )}
              </div>
            </div>

            {/* ユーザー介入フォーム */}
            <InputForm 
              onSubmit={handleNextTurn} 
              onEnd={handleEndDebate}
              currentTurn={turns.length}
              maxTurns={3}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </main>
  );
}
