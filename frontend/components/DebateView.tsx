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
        🎭 議論の様子
      </h2>

      <div className="space-y-2">
        {turns.map((turn) => (
          <div key={turn.turn_id}>
            {/* ターン区切り（控えめに） */}
            {turn.turn_id > 1 && (
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  ターン {turn.turn_id}
                </div>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
              </div>
            )}

            {/* エージェントのメッセージ（チャット形式） */}
            <div>
              {[...turn.debate].reverse().map((message, msgIndex) => (
                <AgentMessage 
                  key={`${turn.turn_id}-${message.agent_name}`} 
                  message={message}
                  index={msgIndex}
                />
              ))}
            </div>

            {/* 審判の判定 */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 border-l-4 border-slate-400 dark:border-slate-500 rounded-r-lg p-4 my-4 mx-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚖️</span>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  AI審判の判定
                </h4>
                <span className="ml-auto text-lg font-bold text-slate-700 dark:text-slate-300">
                  {turn.judge.score}%
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
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
