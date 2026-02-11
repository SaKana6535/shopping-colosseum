/**
 * Shopping Colosseum - 型定義
 * Backendのデータモデルと対応
 */

export type AgentRole = 
  | 'logical' 
  | 'emotional' 
  | 'critical' 
  | 'cost_conscious' 
  | 'eco_friendly' 
  | 'aesthetic' 
  | 'practical' 
  | 'data_driven' 
  | 'trendy' 
  | 'social_proof';

export interface AgentMessage {
  agent_name: string;
  role: AgentRole;
  content: string;
}

export interface AgentConfig {
  role: AgentRole;
  name: string;
  jaName: string;
  icon: string;
  description: string;
  bgColor: string;
  skinColor: string;
  label: string;
}

export interface JudgeResult {
  score: number;  // 0-100
  reason: string;
}

export interface DebateTurn {
  turn_id: number;
  debate: AgentMessage[];
  judge: JudgeResult;
}

export interface StartDebateRequest {
  product_url: string;
  user_query: string;
  selected_agents?: string[];
}

export interface StartDebateResponse {
  session_id: string;
  turn: DebateTurn;
}

export interface NextTurnRequest {
  session_id: string;
  user_intervention?: string;
}

export interface NextTurnResponse {
  turn: DebateTurn;
}

// UI用の拡張型
export interface DebateState {
  sessionId: string | null;
  turns: DebateTurn[];
  isLoading: boolean;
  error: string | null;
}
