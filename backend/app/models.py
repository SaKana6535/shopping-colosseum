from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional
from datetime import datetime


# エージェントのロール型
AgentRole = Literal[
    'logical', 'emotional', 'critical', 'cost_conscious', 'eco_friendly',
    'aesthetic', 'practical', 'data_driven', 'trendy', 'social_proof',
]

# 議論モード型
DebateMode = Literal['battle', 'review']


class AgentMessage(BaseModel):
    """エージェント個別のメッセージ"""
    agent_name: str
    role: AgentRole
    content: str


class JudgeResult(BaseModel):
    """AI審判の判定結果"""
    score: int = Field(ge=0, le=100, description="購入推奨度（0〜100）")
    reason: str


class DebateTurn(BaseModel):
    """1ターンの議論データ"""
    turn_id: int
    debate: List[AgentMessage]
    judge: JudgeResult


class StartDebateRequest(BaseModel):
    """議論開始リクエスト"""
    product_url: str
    user_query: str
    selected_agents: List[AgentRole] = ['logical', 'emotional', 'critical']
    debate_mode: DebateMode = 'battle'

    @field_validator('selected_agents')
    @classmethod
    def validate_selected_agents(cls, v: List[str]) -> List[str]:
        if len(v) < 1:
            raise ValueError('最低1人のエージェントを選択してください')
        if len(v) > 10:
            raise ValueError('エージェントは最大10人までです')
        if len(v) != len(set(v)):
            raise ValueError('エージェントが重複しています')
        return v


class StartDebateResponse(BaseModel):
    """議論開始レスポンス"""
    session_id: str
    turn: DebateTurn


class NextTurnRequest(BaseModel):
    """次ターンリクエスト"""
    session_id: str
    user_intervention: Optional[str] = None


class NextTurnResponse(BaseModel):
    """次ターンレスポンス"""
    turn: DebateTurn


# --- 議論ログ関連モデル ---


class DebateLogSummary(BaseModel):
    """議論ログの概要（一覧用）"""
    session_id: str
    product_url: str
    user_query: str
    current_turn: int
    title: str = ""  # 議論のタイトル（チャット風表示用）
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DebateLogDetail(BaseModel):
    """議論ログの詳細"""
    session_id: str
    product_url: str
    user_query: str
    current_turn: int
    history: List[DebateTurn]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DebateLogListResponse(BaseModel):
    """議論ログ一覧レスポンス"""
    logs: List[DebateLogSummary]
    count: int
