from fastapi import APIRouter, HTTPException
from ..models import (
    StartDebateRequest,
    StartDebateResponse,
    NextTurnRequest,
    NextTurnResponse,
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
        user_query=request.user_query
    )
    
    # 初回の議論を生成
    turn = await ai_service.generate_debate(
        turn_id=1,
        product_url=request.product_url,
        user_query=request.user_query,
        user_intervention=None,
        history=None,
    )
    
    # セッションに保存
    session.add_turn(turn.model_dump())
    
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
        user_intervention=request.user_intervention,
        history=session.history,
    )
    
    # セッションに保存
    session.add_turn(turn.model_dump())
    
    return NextTurnResponse(turn=turn)
