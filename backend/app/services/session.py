from typing import Dict, List, Optional
from datetime import datetime
import uuid


class DebateSession:
    """議論セッションのデータクラス"""
    def __init__(self, session_id: str, product_url: str, user_query: str):
        self.session_id = session_id
        self.product_url = product_url
        self.user_query = user_query
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


class SessionManager:
    """セッション管理クラス（メモリ内）"""
    def __init__(self):
        self.sessions: Dict[str, DebateSession] = {}
    
    def create_session(self, product_url: str, user_query: str) -> DebateSession:
        """新規セッションを作成"""
        session_id = str(uuid.uuid4())
        session = DebateSession(session_id, product_url, user_query)
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[DebateSession]:
        """セッションを取得"""
        return self.sessions.get(session_id)
    
    def delete_session(self, session_id: str):
        """セッションを削除"""
        if session_id in self.sessions:
            del self.sessions[session_id]


# グローバルなセッションマネージャーインスタンス
session_manager = SessionManager()
