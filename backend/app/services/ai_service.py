"""AIサービスの抽象基底クラス"""

from abc import ABC, abstractmethod
from typing import List, Optional

from ..models import DebateTurn


class AIServiceBase(ABC):
    """AIサービスの共通インターフェース
    
    MockAIService と GeminiAIService の両方がこのクラスを継承し、
    同一のインターフェースで議論を生成できるようにする。
    """

    @abstractmethod
    async def generate_debate(
        self,
        turn_id: int,
        product_url: str,
        user_query: str,
        selected_agents: Optional[List[str]] = None,
        user_intervention: Optional[str] = None,
        history: Optional[List[dict]] = None,
    ) -> DebateTurn:
        """1ターン分の議論を生成する
        
        Args:
            turn_id: ターン番号
            product_url: 商品URL
            user_query: ユーザーの悩み・質問
            selected_agents: 議論に参加するエージェントのロール一覧（オプション）
            user_intervention: ユーザーからの議論への介入（オプション）
            history: これまでの議論履歴（オプション）
        
        Returns:
            DebateTurn: 3人のエージェントの発言 + AI審判の判定
        """
        ...
