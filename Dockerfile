# ============================================
# Stage 1: Frontend ビルド（Next.js 静的エクスポート）
# ============================================
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

# 依存関係ファイルを先にコピー（キャッシュ活用）
COPY frontend/package.json frontend/package-lock.json ./

# 依存関係インストール
RUN npm ci

# ソースコードをコピー
COPY frontend/ ./

# 本番ビルド時は同一オリジンなので API URL は空
ENV NEXT_PUBLIC_API_URL=""

# 静的ファイルとしてビルド
RUN npm run build

# ============================================
# Stage 2: Backend（FastAPI + 静的ファイル配信）
# ============================================
FROM python:3.11-slim

WORKDIR /app

# システム依存パッケージ
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係インストール
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# バックエンドのソースコードをコピー
COPY backend/app ./app

# Stage 1 からビルド済みの静的ファイルをコピー
COPY --from=frontend-builder /app/frontend/out ./static

# 環境変数のデフォルト値
ENV PORT=8080
ENV STATIC_FILES_DIR=/app/static
ENV AI_SERVICE_MODE=mock

# Cloud Run は PORT 環境変数を自動設定する
EXPOSE ${PORT}

# uvicorn でアプリケーションを起動
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
