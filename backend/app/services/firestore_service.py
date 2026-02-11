"""Firestore サービス - 議論ログの永続化"""

import logging
from datetime import datetime
from typing import Optional

from google.cloud import firestore

from ..config import settings

logger = logging.getLogger(__name__)

# Firestoreクライアントのシングルトン
_firestore_client: Optional[firestore.Client] = None


def get_firestore_client() -> firestore.Client:
    """Firestoreクライアントを取得（シングルトン）"""
    global _firestore_client
    if _firestore_client is None:
        project = settings.GOOGLE_CLOUD_PROJECT or None
        _firestore_client = firestore.Client(project=project)
        logger.info(f"Firestore client initialized (project={project})")
    return _firestore_client


def _get_collection():
    """議論コレクションの参照を取得"""
    client = get_firestore_client()
    return client.collection(settings.FIRESTORE_COLLECTION)


def save_session(
    session_id: str,
    product_url: str,
    user_query: str,
    current_turn: int,
    history: list[dict],
    created_at: datetime,
    title: str | None = None,
) -> None:
    """セッション全体をFirestoreに保存（作成または更新）"""
    collection = _get_collection()
    doc_ref = collection.document(session_id)
    data = {
        "session_id": session_id,
        "product_url": product_url,
        "user_query": user_query,
        "current_turn": current_turn,
        "history": history,
        "created_at": created_at,
        "updated_at": datetime.now(),
    }
    if title is not None:
        data["title"] = title
    doc_ref.set(data)
    logger.debug(f"Session {session_id} saved to Firestore (turn={current_turn})")


def load_session(session_id: str) -> Optional[dict]:
    """Firestoreからセッションを読み込む"""
    collection = _get_collection()
    doc = collection.document(session_id).get()
    if doc.exists:
        return doc.to_dict()
    return None


def list_sessions(limit: int = 20, offset: int = 0) -> list[dict]:
    """議論ログの一覧を取得（新しい順）"""
    from .title_generator import generate_debate_title

    collection = _get_collection()
    query = (
        collection.order_by("created_at", direction=firestore.Query.DESCENDING)
        .offset(offset)
        .limit(limit)
    )
    docs = query.stream()

    sessions = []
    for doc in docs:
        data = doc.to_dict()
        title = data.get("title")
        # 既存データにtitleがない場合は議論内容から生成
        if not title and data.get("history"):
            first_turn = data["history"][0]
            title = generate_debate_title(
                first_turn,
                user_query=data.get("user_query", ""),
                product_url=data.get("product_url", ""),
            )
        sessions.append(
            {
                "session_id": data.get("session_id"),
                "product_url": data.get("product_url"),
                "user_query": data.get("user_query"),
                "current_turn": data.get("current_turn", 0),
                "title": title or "",
                "created_at": data.get("created_at"),
                "updated_at": data.get("updated_at"),
            }
        )
    return sessions


def delete_session(session_id: str) -> bool:
    """Firestoreからセッションを削除"""
    collection = _get_collection()
    doc_ref = collection.document(session_id)
    doc = doc_ref.get()
    if doc.exists:
        doc_ref.delete()
        logger.info(f"Session {session_id} deleted from Firestore")
        return True
    return False
