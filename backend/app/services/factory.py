"""AIサービスファクトリ - 環境変数に基づいてサービスインスタンスを切り替える"""

import logging
from typing import Optional

from ..config import settings
from .ai_service import AIServiceBase
from .mock_ai import MockAIService

logger = logging.getLogger(__name__)

# シングルトンインスタンスのキャッシュ
_ai_service_instance: Optional[AIServiceBase] = None


def get_ai_service() -> AIServiceBase:
    """環境変数 AI_SERVICE_MODE に基づいてAIサービスを返す

    - "mock" (デフォルト): MockAIService（テンプレートベース）
    - "gemini": GeminiAIService（Vertex AI Gemini API）

    Returns:
        AIServiceBase: AIサービスインスタンス
    """
    global _ai_service_instance

    if _ai_service_instance is not None:
        return _ai_service_instance

    mode = settings.AI_SERVICE_MODE.lower()

    if mode == "gemini":
        # Geminiモードの場合のみインポート（依存ライブラリが必要なため）
        from .gemini_ai import GeminiAIService

        _ai_service_instance = GeminiAIService()
        logger.info("AI Service Mode: gemini (Vertex AI Gemini API)")
    else:
        _ai_service_instance = MockAIService()
        logger.info("AI Service Mode: mock (template-based)")

    return _ai_service_instance
