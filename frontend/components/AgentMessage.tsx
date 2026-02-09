'use client';

import { AgentMessage as AgentMessageType } from '@/types/debate';

interface AgentMessageProps {
  message: AgentMessageType;
  index: number;
}

const agentConfig = {
  logical: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    icon: '🧠',
  },
  emotional: {
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    iconColor: 'text-pink-600 dark:text-pink-400',
    icon: '❤️',
  },
  critical: {
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    icon: '⚠️',
  },
};

export default function AgentMessage({ message, index }: AgentMessageProps) {
  const config = agentConfig[message.role];

  return (
    <div 
      className={`debate-message border ${config.bgColor} ${config.borderColor}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-bold ${config.iconColor}`}>
              {message.agent_name}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {message.role === 'logical' && '論理派'}
              {message.role === 'emotional' && '感情派'}
              {message.role === 'critical' && '慎重派'}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
