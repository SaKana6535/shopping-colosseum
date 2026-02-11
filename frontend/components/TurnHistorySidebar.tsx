'use client';

import { DebateTurn } from '@/types/debate';

interface TurnHistorySidebarProps {
  turns: DebateTurn[];
  currentTurnId: number | null;
  onSelectTurn: (turnId: number) => void;
  isLoading?: boolean;
}

export default function TurnHistorySidebar({ turns, currentTurnId, onSelectTurn, isLoading = false }: TurnHistorySidebarProps) {
  if (turns.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-slate-700 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`} style={{ minHeight: '600px', maxHeight: '600px', overflowY: 'auto' }}>
      <div className="sticky top-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 pb-3 mb-4 border-b-2 border-slate-200 dark:border-slate-700 z-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📜</span>
          議論履歴
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {turns.length}ターン完了
        </p>
      </div>
      
      <div className="space-y-3">
        {turns.map((turn) => {
          const isActive = turn.turn_id === currentTurnId;
          const scoreColor = 
            turn.judge.score < 40 
              ? 'bg-red-500' 
              : turn.judge.score < 60 
              ? 'bg-yellow-500' 
              : 'bg-green-500';
          
          const scoreTextColor = 
            turn.judge.score < 40 
              ? 'text-red-600 dark:text-red-400' 
              : turn.judge.score < 60 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-green-600 dark:text-green-400';
          
          return (
            <button
              key={turn.turn_id}
              onClick={() => onSelectTurn(turn.turn_id)}
              className={`w-full text-left p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
                isActive
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500 shadow-lg'
                  : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${scoreColor} ${isActive ? 'animate-pulse' : ''}`}></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    ターン {turn.turn_id}
                  </span>
                </div>
                <div className={`text-lg font-bold ${scoreTextColor}`}>
                  {turn.judge.score}%
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {turn.judge.reason}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
