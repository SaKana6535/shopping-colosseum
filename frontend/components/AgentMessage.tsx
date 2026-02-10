'use client';

import { AgentMessage as AgentMessageType } from '@/types/debate';

interface AgentMessageProps {
  message: AgentMessageType;
  index: number;
}

const agentConfig = {
  logical: {
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    shadowColor: 'shadow-blue-200 dark:shadow-blue-900/50',
    icon: '🧠',
    name: 'Mr. Logic',
    label: '論理派',
  },
  emotional: {
    gradient: 'from-pink-500 to-pink-600',
    bgColor: 'bg-gradient-to-br from-pink-500 to-pink-600',
    shadowColor: 'shadow-pink-200 dark:shadow-pink-900/50',
    icon: '❤️',
    name: 'Ms. Emotion',
    label: '感情派',
  },
  critical: {
    gradient: 'from-amber-500 to-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
    shadowColor: 'shadow-amber-200 dark:shadow-amber-900/50',
    icon: '⚠️',
    name: 'Dr. Risk',
    label: '慎重派',
  },
};

export default function AgentMessage({ message, index }: AgentMessageProps) {
  const config = agentConfig[message.role];

  return (
    <div className="flex gap-4 mb-5 debate-message group">
      {/* アバター */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl shadow-lg ${config.shadowColor} transform group-hover:scale-110 transition-transform`}>
        {config.icon}
      </div>
      
      {/* メッセージ本体 */}
      <div className="flex-1 min-w-0">
        {/* 名前とラベル */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            {message.agent_name}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} text-white font-medium`}>
            {config.label}
          </span>
        </div>
        
        {/* メッセージ内容 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-700 group-hover:shadow-lg transition-shadow">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

