# デプロイガイド

Shopping Colosseum を Google Cloud Run にデプロイする手順をまとめたドキュメントです。

## アーキテクチャ

Frontend（Next.js）を静的ファイルとしてビルドし、Backend（FastAPI）から配信する **1コンテナ構成** です。

```
┌─────────────────────────────────────────┐
│           Cloud Run Service             │
│  ┌───────────────────────────────────┐  │
│  │         Single Container          │  │
│  │                                   │  │
│  │  FastAPI (Python)                 │  │
│  │  ├── /api/*     → API ルート     │  │
│  │  ├── /health    → ヘルスチェック  │  │
│  │  ├── /_next/*   → 静的アセット   │  │
│  │  └── /*         → index.html     │  │
│  │                                   │  │
│  │  Static Files (Next.js export)    │  │
│  └───────────────────────────────────┘  │
│                    │                     │
│              Vertex AI (Gemini)          │
└─────────────────────────────────────────┘
```

### なぜ1コンテナ構成か

- フロントエンドは全て `'use client'` のクライアントサイドレンダリング
- Next.js の `output: 'export'` で静的HTML/JS/CSSに変換可能
- FastAPI の `StaticFiles` で配信するため、別途Webサーバーが不要
- Cloud Run のサービスが1つで済むため、管理・コストがシンプル

## 前提条件

- Google Cloud プロジェクトが作成済み
- `gcloud` CLI がインストール・認証済み
- Docker がインストール済み（ローカルテスト用）

```bash
# gcloud の認証確認
gcloud auth list

# プロジェクトの確認
gcloud config get-value project
```

## ローカルでの Docker テスト

デプロイ前にローカルで動作確認できます。

### ビルド

```bash
docker build -t shopping-colosseum .
```

### 起動

```bash
# mockモードで起動
docker run -p 8080:8080 -e AI_SERVICE_MODE=mock shopping-colosseum

# geminiモードで起動（ローカルの認証情報を使用）
docker run -p 8080:8080 \
  -e AI_SERVICE_MODE=gemini \
  -e GOOGLE_CLOUD_PROJECT=shopping-colosseum \
  -e VERTEX_AI_LOCATION=us-central1 \
  -v ~/.config/gcloud:/root/.config/gcloud:ro \
  shopping-colosseum
```

### 動作確認

```bash
# ヘルスチェック
curl http://localhost:8080/health

# フロントエンド
open http://localhost:8080

# API テスト
curl -X POST http://localhost:8080/api/debate/start \
  -H "Content-Type: application/json" \
  -d '{"product_url":"https://example.com","user_query":"買うべき？","selected_agents":["logical","emotional","critical"]}'
```

## Cloud Run へのデプロイ

### 初回デプロイ

`--source .` を使うと Cloud Build が自動で Dockerfile を検出してビルド・デプロイします。
初回は必要な API（Cloud Run, Cloud Build, Artifact Registry）が自動で有効化されます。

```bash
gcloud run deploy shopping-colosseum \
  --project shopping-colosseum \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "AI_SERVICE_MODE=mock" \
  --memory 512Mi \
  --timeout 300 \
  --quiet
```

### Gemini API を有効にしてデプロイ

```bash
# 1. サービスアカウントに Vertex AI の権限を付与（初回のみ）
gcloud projects add-iam-policy-binding shopping-colosseum \
  --member="serviceAccount:337451317627-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# 2. gemini モードでデプロイ
gcloud run deploy shopping-colosseum \
  --project shopping-colosseum \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "AI_SERVICE_MODE=gemini,GOOGLE_CLOUD_PROJECT=shopping-colosseum,VERTEX_AI_LOCATION=us-central1" \
  --memory 512Mi \
  --timeout 300 \
  --quiet
```

### 環境変数のみ更新（再ビルドなし）

コードを変更せず環境変数だけ切り替えたい場合:

```bash
gcloud run services update shopping-colosseum \
  --project shopping-colosseum \
  --region us-central1 \
  --set-env-vars "AI_SERVICE_MODE=gemini,GOOGLE_CLOUD_PROJECT=shopping-colosseum"
```

## 環境変数一覧

| 変数名 | 説明 | デフォルト | 例 |
|---|---|---|---|
| `AI_SERVICE_MODE` | AIサービスの切り替え | `mock` | `mock` / `gemini` |
| `GOOGLE_CLOUD_PROJECT` | GCPプロジェクトID | (空) | `shopping-colosseum` |
| `VERTEX_AI_LOCATION` | Vertex AIのリージョン | `us-central1` | `us-central1` |
| `VERTEX_AI_MODEL` | 使用するGeminiモデル | `gemini-2.0-flash` | `gemini-2.0-flash` |
| `PORT` | サーバーポート | `8080`(Docker) / `8000`(ローカル) | Cloud Runが自動設定 |
| `STATIC_FILES_DIR` | 静的ファイルのパス | (空) | `/app/static` |
| `ALLOWED_ORIGINS` | CORS許可オリジン（カンマ区切り） | `http://localhost:3000` | `https://example.com` |
| `DEBUG` | デバッグモード | `False` | `True` / `False` |

## Dockerfile の構成

マルチステージビルドを採用しています。

| ステージ | ベースイメージ | 役割 |
|---|---|---|
| `frontend-builder` | `node:24-alpine` | Next.js を静的エクスポート (`npm run build` → `out/`) |
| 最終ステージ | `python:3.11-slim` | FastAPI + 静的ファイル配信 |

### ビルドの流れ

1. **Stage 1**: `frontend/` の依存関係をインストールし、`npm run build` で `out/` ディレクトリに静的ファイルを生成
2. **Stage 2**: `backend/` の依存関係をインストールし、Stage 1 の `out/` を `/app/static` にコピー
3. `uvicorn` で FastAPI を起動。`STATIC_FILES_DIR` が設定されていれば静的ファイルも配信

## サービスの管理

### デプロイ状況の確認

```bash
gcloud run services describe shopping-colosseum \
  --project shopping-colosseum \
  --region us-central1 \
  --format="value(status.url)"
```

### ログの確認

```bash
gcloud run services logs read shopping-colosseum \
  --project shopping-colosseum \
  --region us-central1 \
  --limit 50
```

### サービスの削除

```bash
gcloud run services delete shopping-colosseum \
  --project shopping-colosseum \
  --region us-central1
```

## トラブルシューティング

### PERMISSION_DENIED エラー

Cloud Build のデフォルトサービスアカウントに権限が不足している場合:

```bash
PROJECT_NUMBER=337451317627

gcloud projects add-iam-policy-binding shopping-colosseum \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding shopping-colosseum \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

gcloud projects add-iam-policy-binding shopping-colosseum \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### フロントエンドが表示されない

- `STATIC_FILES_DIR` 環境変数が正しく設定されているか確認
- Docker コンテナ内で `/app/static/index.html` が存在するか確認:
  ```bash
  docker run --rm shopping-colosseum ls -la /app/static/
  ```

### ローカル開発時にAPIに接続できない

フロントエンドの開発サーバー (`npm run dev`) を使う場合は、`frontend/.env.local` を作成:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

これがないと API 呼び出しが相対パス（同一オリジン）になり、Next.js の開発サーバー (port 3000) に向かってしまいます。
