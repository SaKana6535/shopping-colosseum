'use client';

import { AgentMessage as AgentMessageType } from '@/types/debate';
import { getAgentConfig } from '@/lib/agentConfigs';
import AvatarIcon from './AvatarIcon';

interface AgentMessageProps {
  message: AgentMessageType;
  index: number;
}

export default function AgentMessage({ message, index }: AgentMessageProps) {
  const config = getAgentConfig(message.role);

  return (
    <div className="flex gap-3 mb-4 debate-message animate-slideIn">
      {/* アバター */}
      <div className={`flex-shrink-0 w-11 h-11 rounded-full ${config.bgColor} flex items-center justify-center shadow-lg agent-avatar-${message.role}`}>
        <AvatarIcon role={message.role} skinColor={config.skinColor} />
      </div>
      
      {/* メッセージ本体 */}
      <div className="flex-1 min-w-0">
        {/* 名前 */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
            {message.agent_name}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {config.label}
          </span>
        </div>
        
        {/* 吹き出し風メッセージ */}
        <div className="relative">
          <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-slate-700"></div>
          <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-600">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

