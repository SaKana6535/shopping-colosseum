from fastapi import APIRouter, HTTPException, Query
from ..config import settings
from ..models import (
    StartDebateRequest,
    StartDebateResponse,
    NextTurnRequest,
    NextTurnResponse,
    DebateLogSummary,
    DebateLogDetail,
    DebateLogListResponse,
    DebateTurn,
)
from ..services.session import session_manager
from ..services.factory import get_ai_service

router = APIRouter(prefix="/api/debate", tags=["debate"])


@router.post("/start", response_model=StartDebateResponse)
async def start_debate(request: StartDebateRequest):
    """
    議論を開始する

    商品URLとユーザーの悩みを受け取り、
    新規セッションを作成して初回の議論を返す
    """
    ai_service = get_ai_service()

    # セッションを作成
    session = session_manager.create_session(
        product_url=request.product_url,
        user_query=request.user_query,
        selected_agents=request.selected_agents
    )

    # 初回の議論を生成
    turn = await ai_service.generate_debate(
        turn_id=1,
        product_url=request.product_url,
        user_query=request.user_query,
        selected_agents=request.selected_agents,
        user_intervention=None,
        history=None,
    )

    # セッションに保存
    session.add_turn(turn.model_dump())
    session_manager.save_session(session)

    return StartDebateResponse(
        session_id=session.session_id,
        turn=turn
    )


@router.post("/next_turn", response_model=NextTurnResponse)
async def next_turn(request: NextTurnRequest):
    """
    次のターンの議論を生成する

    セッションIDとユーザーの介入（オプション）を受け取り、
    次のターンの議論を生成して返す
    """
    ai_service = get_ai_service()

    # セッションを取得
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 次のターンIDを取得
    next_turn_id = session.get_next_turn_id()

    # 次のターンの議論を生成（履歴を渡してコンテキストを維持）
    turn = await ai_service.generate_debate(
        turn_id=next_turn_id,
        product_url=session.product_url,
        user_query=session.user_query,
        selected_agents=session.selected_agents,
        user_intervention=request.user_intervention,
        history=session.history,
    )

    # セッションに保存
    session.add_turn(turn.model_dump())
    session_manager.save_session(session)

    return NextTurnResponse(turn=turn)


# --- 議論ログ閲覧エンドポイント（Firestore有効時のみ） ---


@router.get("/logs", response_model=DebateLogListResponse)
async def list_debate_logs(
    limit: int = Query(default=20, ge=1, le=100, description="取得件数"),
    offset: int = Query(default=0, ge=0, description="オフセット"),
):
    """
    議論ログの一覧を取得する（Firestore有効時のみ）
    """
    if not settings.FIRESTORE_ENABLED:
        raise HTTPException(
            status_code=501,
            detail="Firestore is not enabled. Set FIRESTORE_ENABLED=true to use this feature.",
        )

    from ..services import firestore_service

    sessions = firestore_service.list_sessions(limit=limit, offset=offset)
    logs = [DebateLogSummary(**s) for s in sessions]

    return DebateLogListResponse(logs=logs, count=len(logs))


@router.get("/logs/{session_id}", response_model=DebateLogDetail)
async def get_debate_log(session_id: str):
    """
    議論ログの詳細を取得する（Firestore有効時のみ）
    """
    if not settings.FIRESTORE_ENABLED:
        raise HTTPException(
            status_code=501,
            detail="Firestore is not enabled. Set FIRESTORE_ENABLED=true to use this feature.",
        )

    from ..services import firestore_service

    data = firestore_service.load_session(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Debate log not found")

    # historyの各要素をDebateTurnモデルに変換
    history = [DebateTurn(**turn) for turn in data.get("history", [])]

    return DebateLogDetail(
        session_id=data["session_id"],
        product_url=data["product_url"],
        user_query=data["user_query"],
        current_turn=data.get("current_turn", 0),
        history=history,
        created_at=data.get("created_at"),
        updated_at=data.get("updated_at"),
    )


@router.delete("/logs/{session_id}")
async def delete_debate_log(session_id: str):
    """
    議論ログを削除する（Firestore有効時のみ）
    """
    if not settings.FIRESTORE_ENABLED:
        raise HTTPException(
            status_code=501,
            detail="Firestore is not enabled. Set FIRESTORE_ENABLED=true to use this feature.",
        )

    from ..services import firestore_service

    deleted = firestore_service.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Debate log not found")

    return {"message": "Debate log deleted", "session_id": session_id}
