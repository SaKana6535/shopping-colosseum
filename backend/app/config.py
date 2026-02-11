"""アプリケーション設定 - 環境変数の一元管理"""

import os
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()


class Settings:
    """環境変数ベースの設定クラス"""

    # AIサービスモード: "mock" | "gemini"
    AI_SERVICE_MODE: str = os.getenv("AI_SERVICE_MODE", "mock")

    # Google Cloud設定
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")

    # Vertex AI設定
    VERTEX_AI_LOCATION: str = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    VERTEX_AI_MODEL: str = os.getenv("VERTEX_AI_MODEL", "gemini-2.0-flash")

    # アプリケーション設定
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # CORS設定（カンマ区切りで複数指定可）
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    # Firestore設定
    FIRESTORE_ENABLED: bool = os.getenv("FIRESTORE_ENABLED", "False").lower() in ("true", "1", "yes")
    FIRESTORE_COLLECTION: str = os.getenv("FIRESTORE_COLLECTION", "debates")

    # 静的ファイル配信設定
    STATIC_FILES_DIR: str = os.getenv("STATIC_FILES_DIR", "")


# グローバル設定インスタンス
settings = Settings()
