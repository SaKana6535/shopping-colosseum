/**
 * API呼び出しユーティリティ
 */

import {
  StartDebateRequest,
  StartDebateResponse,
  NextTurnRequest,
  NextTurnResponse,
  DebateLogListResponse,
  DebateLogDetail,
  DebateMode,
} from '@/types/debate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * 議論を開始する
 */
export async function startDebate(
  productUrl: string,
  userQuery: string,
  selectedAgents: string[] = ['logical', 'emotional', 'critical'],
  debateMode: DebateMode = 'battle',
): Promise<StartDebateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/debate/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_url: productUrl,
      user_query: userQuery,
      selected_agents: selectedAgents,
      debate_mode: debateMode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start debate: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 次のターンを取得する
 */
export async function getNextTurn(
  request: NextTurnRequest
): Promise<NextTurnResponse> {
  const response = await fetch(`${API_BASE_URL}/api/debate/next_turn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to get next turn: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 議論ログ一覧を取得する
 */
export async function fetchDebateLogs(
  limit: number = 20,
  offset: number = 0
): Promise<DebateLogListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/debate/logs?limit=${limit}&offset=${offset}`
  );

  if (response.status === 501) {
    throw new Error('FIRESTORE_DISABLED');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch debate logs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 議論ログ詳細を取得する
 */
export async function fetchDebateLogDetail(
  sessionId: string
): Promise<DebateLogDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/debate/logs/${encodeURIComponent(sessionId)}`
  );

  if (response.status === 501) {
    throw new Error('FIRESTORE_DISABLED');
  }

  if (response.status === 404) {
    throw new Error('Debate log not found');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch debate log: ${response.statusText}`);
  }

  return response.json();
}
