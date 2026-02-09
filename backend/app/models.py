from pydantic import BaseModel
from typing import List, Literal, Optional


class AgentMessage(BaseModel):
    """エージェント個別のメッセージ"""
    agent_name: str
    role: Literal['logical', 'emotional', 'critical']
    content: str


class JudgeResult(BaseModel):
    """AI審判の判定結果"""
    score: int  # 0-100
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
