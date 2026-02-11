"""セッション管理 - メモリ内またはFirestoreバックエンド"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from datetime import datetime
import logging
import uuid

from ..config import settings

logger = logging.getLogger(__name__)


class DebateSession:
    """議論セッションのデータクラス"""
    def __init__(self, session_id: str, product_url: str, user_query: str,
                 selected_agents: Optional[List[str]] = None,
                 debate_mode: str = "discussion"):
        self.session_id = session_id
        self.product_url = product_url
        self.user_query = user_query
        self.selected_agents = selected_agents or ['logical', 'emotional', 'critical']
        self.debate_mode = debate_mode
        self.current_turn = 0
        self.history: List[dict] = []
        self.created_at = datetime.now()

    def add_turn(self, turn_data: dict):
        """ターンを履歴に追加"""
        self.current_turn += 1
        self.history.append(turn_data)

    def get_next_turn_id(self) -> int:
        """次のターンIDを取得"""
        return self.current_turn + 1

    def to_dict(self) -> dict:
        """辞書形式に変換"""
        return {
            "session_id": self.session_id,
            "product_url": self.product_url,
            "user_query": self.user_query,
            "selected_agents": self.selected_agents,
            "debate_mode": self.debate_mode,
            "current_turn": self.current_turn,
            "history": self.history,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "DebateSession":
        """辞書からセッションを復元"""
        session = cls(
            session_id=data["session_id"],
            product_url=data["product_url"],
            user_query=data["user_query"],
            selected_agents=data.get("selected_agents"),
            debate_mode=data.get("debate_mode", "discussion"),
        )
        session.current_turn = data.get("current_turn", 0)
        session.history = data.get("history", [])
        session.created_at = data.get("created_at", datetime.now())
        return session


class SessionManagerBase(ABC):
    """セッション管理の抽象基底クラス"""

    @abstractmethod
    def create_session(self, product_url: str, user_query: str,
                       selected_agents: Optional[List[str]] = None,
                       debate_mode: str = "discussion") -> DebateSession:
        """新規セッションを作成"""
        ...

    @abstractmethod
    def get_session(self, session_id: str) -> Optional[DebateSession]:
        """セッションを取得"""
        ...

    @abstractmethod
    def save_session(self, session: DebateSession) -> None:
        """セッションを保存（ターン追加後の永続化用）"""
        ...

    @abstractmethod
    def delete_session(self, session_id: str) -> None:
        """セッションを削除"""
        ...


class InMemorySessionManager(SessionManagerBase):
    """セッション管理クラス（メモリ内）"""

    def __init__(self):
        self.sessions: Dict[str, DebateSession] = {}

    def create_session(self, product_url: str, user_query: str,
                       selected_agents: Optional[List[str]] = None,
                       debate_mode: str = "discussion") -> DebateSession:
        """新規セッションを作成"""
        session_id = str(uuid.uuid4())
        session = DebateSession(
            session_id, product_url, user_query, selected_agents,
            debate_mode=debate_mode,
        )
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[DebateSession]:
        """セッションを取得"""
        return self.sessions.get(session_id)

    def save_session(self, session: DebateSession) -> None:
        """セッションを保存（メモリ内なので参照で更新済み、何もしない）"""
        pass

    def delete_session(self, session_id: str) -> None:
        """セッションを削除"""
        if session_id in self.sessions:
            del self.sessions[session_id]


class FirestoreSessionManager(SessionManagerBase):
    """セッション管理クラス（Firestore永続化 + メモリキャッシュ）"""

    def __init__(self):
        self._cache: Dict[str, DebateSession] = {}

    def create_session(self, product_url: str, user_query: str,
                       selected_agents: Optional[List[str]] = None,
                       debate_mode: str = "discussion") -> DebateSession:
        """新規セッションを作成してFirestoreに保存"""
        from . import firestore_service

        session_id = str(uuid.uuid4())
        session = DebateSession(
            session_id, product_url, user_query, selected_agents,
            debate_mode=debate_mode,
        )

        # Firestoreに保存
        firestore_service.save_session(
            session_id=session.session_id,
            product_url=session.product_url,
            user_query=session.user_query,
            current_turn=session.current_turn,
            history=session.history,
            created_at=session.created_at,
            debate_mode=session.debate_mode,
        )

        # キャッシュにも保持
        self._cache[session_id] = session
        logger.info(f"Session {session_id} created and saved to Firestore")
        return session

    def get_session(self, session_id: str) -> Optional[DebateSession]:
        """セッションを取得（キャッシュ → Firestoreの順で検索）"""
        from . import firestore_service

        # キャッシュにあればそれを返す
        if session_id in self._cache:
            return self._cache[session_id]

        # Firestoreから読み込む
        data = firestore_service.load_session(session_id)
        if data is None:
            return None

        session = DebateSession.from_dict(data)
        self._cache[session_id] = session
        return session

    def save_session(self, session: DebateSession) -> None:
        """セッションをFirestoreに永続化"""
        from . import firestore_service
        from .title_generator import generate_debate_title

        title = None
        if session.history:
            title = generate_debate_title(
                session.history[0],
                user_query=session.user_query,
                product_url=session.product_url,
            )

        firestore_service.save_session(
            session_id=session.session_id,
            product_url=session.product_url,
            user_query=session.user_query,
            current_turn=session.current_turn,
            history=session.history,
            created_at=session.created_at,
            title=title,
            debate_mode=session.debate_mode,
        )

    def delete_session(self, session_id: str) -> None:
        """セッションを削除"""
        from . import firestore_service

        firestore_service.delete_session(session_id)
        self._cache.pop(session_id, None)


def _create_session_manager() -> SessionManagerBase:
    """設定に基づいてセッションマネージャーを作成"""
    if settings.FIRESTORE_ENABLED:
        logger.info("Session Manager: Firestore-backed")
        return FirestoreSessionManager()
    else:
        logger.info("Session Manager: In-memory")
        return InMemorySessionManager()


# グローバルなセッションマネージャーインスタンス
session_manager: SessionManagerBase = _create_session_manager()
