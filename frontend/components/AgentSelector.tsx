'use client';

import { useState } from 'react';
import { AgentRole } from '@/types/debate';
import { AGENT_CONFIGS, DEFAULT_AGENTS } from '@/lib/agentConfigs';

interface AgentSelectorProps {
  selectedAgents: AgentRole[];
  onAgentsChange: (agents: AgentRole[]) => void;
}

export default function AgentSelector({ selectedAgents, onAgentsChange }: AgentSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-5 border border-slate-200 dark:border-slate-700 flex flex-col" style={{ height: isExpanded ? 'auto' : 'auto', minHeight: '200px', maxHeight: isExpanded ? '600px' : 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎭</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AIエージェント選択
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedAgents.length}人が議論に参加
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-colors border border-blue-200 dark:border-blue-800"
        >
          {isExpanded ? '✕ 閉じる' : '✎ エージェント編集'}
        </button>
      </div>

      {/* 選択中のエージェント表示（コンパクト） */}
      {!isExpanded && (
        <div className="flex flex-wrap gap-2">
          {selectedAgents.map(role => {
            const config = AGENT_CONFIGS[role];
            return (
              <div
                key={role}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600"
              >
                <span>{config.icon}</span>
                <span>{config.jaName}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* 詳細選択UI */}
      {isExpanded && (
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
                      relative p-3 rounded-lg border-2 text-left transition-all h-[76px]
                      ${isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }
                      ${isOnlyOne ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-102'}
                    `}
                  >
                    <div className="flex items-start gap-2 h-full">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0
                        ${config.bgColor}
                      `}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-bold text-sm mb-0.5 text-slate-900 dark:text-white">
                          {config.jaName}
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {config.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
