'use client';

import { DebateTurn } from '@/types/debate';
import AgentMessage from './AgentMessage';

interface CurrentTurnViewProps {
  turn: DebateTurn;
  isLoading: boolean;
}

export default function CurrentTurnView({ turn, isLoading }: CurrentTurnViewProps) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 relative">
      {/* ヘッダー */}
      <div className="mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-md">
            {turn.turn_id}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ターン {turn.turn_id}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {turn.debate.length}人のエージェントが議論中
            </p>
          </div>
        </div>
      </div>

      {/* ディスカッションエリア */}
      <div className="space-y-1 mb-4">
        {turn.debate.map((message, msgIndex) => (
          <AgentMessage 
            key={`${turn.turn_id}-${message.agent_name}`} 
            message={message}
            index={msgIndex}
          />
        ))}
      </div>

      {/* 審判の判定 - よりコンパクトに */}
      <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0">
            ⚖️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                審判の判定
              </h4>
              <span className={`text-lg font-bold ${
                turn.judge.score < 40 ? 'text-red-600 dark:text-red-400' :
                turn.judge.score < 60 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {turn.judge.score}%
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {turn.judge.reason}
            </p>
          </div>
        </div>
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">💭</span>
            </div>
          </div>
          <span className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
            次のターンを生成中...
          </span>
        </div>
      )}
    </div>
  );
}
