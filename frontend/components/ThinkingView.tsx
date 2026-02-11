'use client';

import { useState, useEffect, useCallback } from 'react';
import { AgentRole } from '@/types/debate';
import { getAgentConfig, THINKING_COMMENTS } from '@/lib/agentConfigs';
import AvatarIcon from './AvatarIcon';

interface ThinkingAgentProps {
  role: AgentRole;
  delay: number;
}

function ThinkingAgent({ role, delay }: ThinkingAgentProps) {
  const config = getAgentConfig(role);
  const comments = THINKING_COMMENTS[role];
  const [currentComment, setCurrentComment] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [commentIndex, setCommentIndex] = useState(0);

  // ランダムな初期インデックスを設定
  const getRandomIndex = useCallback(() => {
    return Math.floor(Math.random() * comments.length);
  }, [comments.length]);

  // 遅延表示
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      const idx = getRandomIndex();
      setCommentIndex(idx);
      setCurrentComment(comments[idx]);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, comments, getRandomIndex]);

  // コメントのローテーション
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCommentIndex(prev => {
        const next = (prev + 1) % comments.length;
        setCurrentComment(comments[next]);
        return next;
      });
    }, 3000 + Math.random() * 2000); // 3〜5秒でコメント切り替え
    return () => clearInterval(interval);
  }, [isVisible, comments]);

  if (!isVisible) {
    return (
      <div className="flex gap-3 mb-4 opacity-0">
        <div className="w-11 h-11" />
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4 thinking-agent-enter">
      {/* アバター */}
      <div className={`flex-shrink-0 w-11 h-11 rounded-full ${config.bgColor} flex items-center justify-center shadow-lg agent-avatar-${role} thinking-avatar`}>
        <AvatarIcon role={role} skinColor={config.skinColor} />
      </div>
      
      {/* メッセージ本体 */}
      <div className="flex-1 min-w-0">
        {/* 名前 */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
            {config.name}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {config.label}
          </span>
        </div>
        
        {/* つぶやき吹き出し */}
        <div className="relative">
          <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-100 dark:border-r-slate-700/60"></div>
          <div className="bg-slate-100 dark:bg-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-200/60 dark:border-slate-600/40">
            <div className="flex items-center gap-2">
              {/* つぶやきテキスト */}
              <p className="text-slate-500 dark:text-slate-400 text-sm italic thinking-comment-fade">
                {currentComment}
              </p>
            </div>
            {/* 考え中ドットアニメーション */}
            <div className="flex gap-1 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 thinking-dot" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 thinking-dot" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 thinking-dot" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ThinkingViewProps {
  selectedAgents: AgentRole[];
}

export default function ThinkingView({ selectedAgents }: ThinkingViewProps) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 relative">
      {/* ヘッダー */}
      <div className="mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-md thinking-header-pulse">
            1
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ターン 1
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              エージェントが商品を分析中...
            </p>
          </div>
          {/* ローディングスピナー */}
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 dark:border-blue-800 border-t-blue-500"></div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">分析中</span>
          </div>
        </div>
      </div>

      {/* エージェントたちの考え中表示 */}
      <div className="space-y-1">
        {selectedAgents.map((role, index) => (
          <ThinkingAgent 
            key={role} 
            role={role} 
            delay={index * 600}
          />
        ))}
      </div>

      {/* 審判の待機表示 */}
      <div className="mt-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200/50 dark:border-indigo-800/30 rounded-xl p-4 shadow-sm opacity-60">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 opacity-50">
            ⚖️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-500 dark:text-slate-500 text-sm">
                審判の判定
              </h4>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-600 italic">
              議論が終わるのを待っています...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
