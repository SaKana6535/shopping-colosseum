import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import settings
from .routers import debate

app = FastAPI(
    title="Shopping Colosseum API",
    description="AIエージェントによる商品購入議論API",
    version="0.1.0"
)

# CORS設定（環境変数で制御）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(debate.router)


@app.get("/health")
async def health():
    """ヘルスチェック"""
    return {"status": "healthy"}


# 静的ファイル配信設定（本番環境用）
static_dir = settings.STATIC_FILES_DIR
if static_dir and Path(static_dir).is_dir():
    static_root = Path(static_dir).resolve()

    # Next.js の _next ディレクトリ（JS/CSS等のアセット）
    next_static_dir = static_root / "_next"
    if next_static_dir.is_dir():
        app.mount("/_next", StaticFiles(directory=str(next_static_dir)), name="next_static")

    # フォールバック: 静的ファイル or index.html を返す
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """静的ファイルを配信し、該当なければ index.html を返す（SPA対応）"""
        file_path = (static_root / full_path).resolve()
        # ../ や絶対パスで static_root の外を参照するリクエストは配信しない（パストラバーサル対策）
        if file_path.is_relative_to(static_root) and file_path.is_file():
            return FileResponse(str(file_path))
        # SPA フォールバック
        index_path = static_root / "index.html"
        if index_path.is_file():
            return FileResponse(str(index_path))
        return {"message": "Shopping Colosseum API", "status": "running", "version": "0.1.0"}
else:
    # 静的ファイルがない場合（開発環境）はAPIのみ
    @app.get("/")
    async def root():
        """ヘルスチェック用エンドポイント"""
        return {
            "message": "Shopping Colosseum API",
            "status": "running",
            "version": "0.1.0"
        }
