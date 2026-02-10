import { AgentConfig, AgentRole } from '@/types/debate';

export const AGENT_CONFIGS: Record<AgentRole, AgentConfig> = {
  logical: {
    role: 'logical',
    name: 'Mr. Logic',
    jaName: '論理派',
    icon: 'avatar',
    description: '論理的に分析し、客観的な視点で評価',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    skinColor: 'bg-blue-200',
    label: '論理的分析'
  },
  emotional: {
    role: 'emotional',
    name: 'Ms. Emotion',
    jaName: '感情派',
    icon: 'avatar',
    description: '感情や直感を重視した評価',
    bgColor: 'bg-gradient-to-br from-pink-500 to-rose-600',
    skinColor: 'bg-pink-200',
    label: '感情的評価'
  },
  critical: {
    role: 'critical',
    name: 'Dr. Risk',
    jaName: '慎重派',
    icon: 'avatar',
    description: 'リスクとデメリットを慎重に検証',
    bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600',
    skinColor: 'bg-orange-200',
    label: 'リスク検証'
  },
  cost_conscious: {
    role: 'cost_conscious',
    name: 'Mr. Budget',
    jaName: 'コスパ派',
    icon: 'avatar',
    description: 'コストパフォーマンスを徹底分析',
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
    skinColor: 'bg-green-200',
    label: 'コスパ重視'
  },
  eco_friendly: {
    role: 'eco_friendly',
    name: 'Ms. Green',
    jaName: 'エコ派',
    icon: 'avatar',
    description: '環境への影響とサステナビリティを評価',
    bgColor: 'bg-gradient-to-br from-lime-500 to-green-600',
    skinColor: 'bg-lime-200',
    label: 'エコ評価'
  },
  aesthetic: {
    role: 'aesthetic',
    name: 'Ms. Design',
    jaName: 'デザイン派',
    icon: 'avatar',
    description: 'デザインと美的価値を重視',
    bgColor: 'bg-gradient-to-br from-purple-500 to-violet-600',
    skinColor: 'bg-purple-200',
    label: 'デザイン評価'
  },
  practical: {
    role: 'practical',
    name: 'Mr. Practical',
    jaName: '実用派',
    icon: 'avatar',
    description: '実用性と使いやすさを重視',
    bgColor: 'bg-gradient-to-br from-slate-500 to-gray-600',
    skinColor: 'bg-slate-200',
    label: '実用性評価'
  },
  data_driven: {
    role: 'data_driven',
    name: 'Dr. Data',
    jaName: 'データ派',
    icon: 'avatar',
    description: 'データと統計に基づいて分析',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    skinColor: 'bg-cyan-200',
    label: 'データ分析'
  },
  trendy: {
    role: 'trendy',
    name: 'Ms. Trend',
    jaName: 'トレンド派',
    icon: 'avatar',
    description: '最新トレンドと流行を重視',
    bgColor: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',
    skinColor: 'bg-fuchsia-200',
    label: 'トレンド分析'
  },
  social_proof: {
    role: 'social_proof',
    name: 'Mr. Social',
    jaName: '口コミ派',
    icon: 'avatar',
    description: '他者の評価と口コミを重視',
    bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    skinColor: 'bg-indigo-200',
    label: '口コミ評価'
  }
};

export const DEFAULT_AGENTS: AgentRole[] = ['logical', 'emotional', 'critical'];

export const getAgentConfig = (role: AgentRole) => AGENT_CONFIGS[role];
