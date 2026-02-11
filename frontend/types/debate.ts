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

// 議論モード
export type DebateMode = 'battle' | 'review';

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
  debate_mode?: DebateMode;
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

// 議論ログ関連（Firestore）
export interface DebateLogSummary {
  session_id: string;
  product_url: string;
  user_query: string;
  current_turn: number;
  title?: string;  // 議論のタイトル（チャット風表示用）
  created_at?: string;
  updated_at?: string;
}

export interface DebateLogDetail {
  session_id: string;
  product_url: string;
  user_query: string;
  current_turn: number;
  history: DebateTurn[];
  created_at?: string;
  updated_at?: string;
}

export interface DebateLogListResponse {
  logs: DebateLogSummary[];
  count: number;
}
