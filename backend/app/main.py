from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import debate

app = FastAPI(
    title="Shopping Colosseum API",
    description="AIエージェントによる商品購入議論API",
    version="0.1.0"
)

# CORS設定（開発環境用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(debate.router)


@app.get("/")
async def root():
    """ヘルスチェック用エンドポイント"""
    return {
        "message": "Shopping Colosseum API",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
async def health():
    """ヘルスチェック"""
    return {"status": "healthy"}
