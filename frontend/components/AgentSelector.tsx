'use client';

import { AgentRole, DebateMode } from '@/types/debate';
import { AGENT_CONFIGS, DEFAULT_AGENTS } from '@/lib/agentConfigs';
import AvatarIcon from './AvatarIcon';

interface AgentSelectorProps {
  selectedAgents: AgentRole[];
  onAgentsChange: (agents: AgentRole[]) => void;
  debateMode: DebateMode;
  onDebateModeChange: (mode: DebateMode) => void;
}

export default function AgentSelector({
  selectedAgents,
  onAgentsChange,
  debateMode,
  onDebateModeChange,
}: AgentSelectorProps) {
  const toggleAgent = (role: AgentRole) => {
    if (selectedAgents.includes(role)) {
      // 最低1人は必要
      if (selectedAgents.length > 1) {
        onAgentsChange(selectedAgents.filter(r => r !== role));
      }
    } else {
      onAgentsChange([...selectedAgents, role]);
    }
  };

  const resetToDefault = () => {
    onAgentsChange([...DEFAULT_AGENTS]);
  };

  const allAgents = Object.values(AGENT_CONFIGS);

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-5 border border-slate-200 dark:border-slate-700 flex flex-col">
      {/* モード切り替え */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">&#128172;</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            議論モード
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onDebateModeChange('discussion')}
            className={`
              relative p-3 rounded-lg border-2 text-left transition-all
              ${debateMode === 'discussion'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 shadow-md'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
              cursor-pointer hover:scale-[1.02]
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">&#128172;</span>
              <span className={`font-bold text-sm ${debateMode === 'discussion' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                ディスカッションモード
              </span>
            </div>
            <p className={`text-[10px] leading-tight ${debateMode === 'discussion' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
              互いに反論・同意し合うディスカッション
            </p>
            {debateMode === 'discussion' && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">&#10003;</span>
              </div>
            )}
          </button>

          <button
            onClick={() => onDebateModeChange('review')}
            className={`
              relative p-3 rounded-lg border-2 text-left transition-all
              ${debateMode === 'review'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-600 shadow-md'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
              cursor-pointer hover:scale-[1.02]
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">&#128221;</span>
              <span className={`font-bold text-sm ${debateMode === 'review' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                レビューモード
              </span>
            </div>
            <p className={`text-[10px] leading-tight ${debateMode === 'review' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
              各自が独立した視点からレビュー
            </p>
            {debateMode === 'review' && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">&#10003;</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 区切り線 */}
      <div className="border-t border-slate-200 dark:border-slate-700 mb-3"></div>

      {/* エージェント選択 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">&#127917;</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AIエージェント選択
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedAgents.length}人が議論に参加
            </p>
          </div>
        </div>
      </div>

      {/* 詳細選択UI */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              議論に参加させるエージェントを選択（最低1人）
            </p>
            <button
              onClick={resetToDefault}
              className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors"
            >
              デフォルト
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {allAgents.map(config => {
              const isSelected = selectedAgents.includes(config.role);
              const isOnlyOne = isSelected && selectedAgents.length === 1;

              return (
                <button
                  key={config.role}
                  onClick={() => toggleAgent(config.role)}
                  disabled={isOnlyOne}
                  className={`
                    relative p-2 rounded-lg border-2 text-left transition-all
                    ${isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 shadow-md'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                    ${isOnlyOne ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-102'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
                      ${config.bgColor}
                    `}>
                      <AvatarIcon role={config.role} skinColor={config.skinColor} />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-bold text-xs mb-0.5 text-slate-900 dark:text-white">
                        {config.jaName}
                      </div>
                      <div className="text-[9px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {config.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">&#10003;</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
