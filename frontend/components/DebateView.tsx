'use client';

import { DebateTurn } from '@/types/debate';
import AgentMessage from './AgentMessage';

interface DebateViewProps {
  turns: DebateTurn[];
  isLoading: boolean;
}

export default function DebateView({ turns, isLoading }: DebateViewProps) {
  if (turns.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        議論の内容
      </h2>

      <div className="space-y-8">
        {turns.map((turn) => (
          <div key={turn.turn_id} className="space-y-4">
            {/* ターン番号 */}
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-semibold">
                ターン {turn.turn_id}
              </div>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            {/* エージェントのメッセージ */}
            <div className="space-y-3">
              {turn.debate.map((message, index) => (
                <AgentMessage 
                  key={`${turn.turn_id}-${message.agent_name}`} 
                  message={message}
                  index={index}
                />
              ))}
            </div>

            {/* 審判の判定 */}
            <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚖️</span>
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  AI審判の判定
                </h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                {turn.judge.reason}
              </p>
            </div>
          </div>
        ))}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-slate-600 dark:text-slate-400">
              次のターンを生成中...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
