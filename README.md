# Shopping Colosseum

AIエージェントによる商品購入議論アプリケーション

3人のAIエージェント（論理派、感情派、慎重派）が、商品について多角的に議論し、AI審判が購入推奨度を判定します。

## プロジェクト構成

```
shopping-colosseum/
├── frontend/          # Next.js (App Router) + TypeScript + Tailwind CSS
├── backend/           # FastAPI + Python
├── docs/              # 設計書・ドキュメント
└── README.md
```

## 技術スタック

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks + SWR

### Backend

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Data Models:** Pydantic
- **Session Management:** メモリ内 (将来的にFirestore)

## セットアップ方法

### 必要な環境

- Node.js 18.x以上
- Python 3.11以上
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd shopping-colosseum
```

### 2. Backend のセットアップ

```bash
cd backend

# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt
```

### 3. Frontend のセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install
```

## 開発サーバーの起動

### Backend サーバー

```bash
cd backend
source venv/bin/activate  # 仮想環境が有効でない場合
uvicorn app.main:app --reload --port 8000
```

アクセス:

- API: http://localhost:8000
- APIドキュメント: http://localhost:8000/docs

### Frontend サーバー

```bash
cd frontend
npm run dev
```

アクセス:

- アプリケーション: http://localhost:3000

## 使い方

1. ブラウザで http://localhost:3000 にアクセス
2. 商品URLとあなたの悩みを入力
3. 「議論を開始する」をクリック
4. 3人のAIエージェントが議論を開始
5. AI審判が購入推奨度を判定
6. 「次のターンへ進む」または「議論に介入する」で続行

## 機能

### 実装済み

- ✅ 商品情報の入力
- ✅ 3人のAIエージェントによる議論（モックデータ）
- ✅ AI審判による購入推奨度の判定
- ✅ ユーザーによる議論への介入
- ✅ レスポンシブデザイン
- ✅ ダークモード対応
- ✅ Google検索Grounding機能
- ✅ 実際のGemini API連携
- ✅ Docker化
- ✅ Google Cloud Runへのデプロイ
- ✅ Firestoreへの議論ログ保存

### 今後の実装予定
- [ ] ユーザー認証

## デプロイ

Cloud Run にデプロイ済みです。

```bash
# mockモードでデプロイ
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

詳細は [デプロイガイド](docs/deploy.md) を参照してください。

## プロジェクト詳細

詳細な設計については以下を参照してください:

- [設計書](docs/document.md)
- [デプロイガイド](docs/deploy.md)
- [Backendドキュメント](backend/README.md)
- [Frontendドキュメント](frontend/README.md)

## ライセンス

このプロジェクトは個人開発プロジェクトです。
