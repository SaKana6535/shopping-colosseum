/**
 * API呼び出しユーティリティ
 */

import {
  StartDebateRequest,
  StartDebateResponse,
  NextTurnRequest,
  NextTurnResponse,
} from '@/types/debate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * 議論を開始する
 */
export async function startDebate(
  productUrl: string,
  userQuery: string,
  selectedAgents: string[] = ['logical', 'emotional', 'critical']
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
