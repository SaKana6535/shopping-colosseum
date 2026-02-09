# Shopping Colosseum - Backend

FastAPIベースのバックエンドAPI

## セットアップ

### 1. 仮想環境の作成と有効化

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. 依存関係のインストール

```bash
pip install -r requirements.txt
```

## 開発サーバーの起動

```bash
uvicorn app.main:app --reload --port 8000
```

サーバーが起動したら:
- API: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## APIエンドポイント

### `POST /api/debate/start`

議論を開始する

**リクエスト:**
```json
{
  "product_url": "https://example.com/product",
  "user_query": "この商品を買うべきか悩んでいます"
}
```

**レスポンス:**
```json
{
  "session_id": "uuid-string",
  "turn": {
    "turn_id": 1,
    "debate": [...],
    "judge": {...}
  }
}
```

### `POST /api/debate/next_turn`

次のターンを生成する

**リクエスト:**
```json
{
  "session_id": "uuid-string",
  "user_intervention": "音質についてもっと詳しく"
}
```

**レスポンス:**
```json
{
  "turn": {
    "turn_id": 2,
    "debate": [...],
    "judge": {...}
  }
}
```

## プロジェクト構成

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPIアプリケーション
│   ├── models.py            # Pydanticモデル
│   ├── routers/
│   │   ├── __init__.py
│   │   └── debate.py        # 議論関連エンドポイント
│   └── services/
│       ├── __init__.py
│       ├── mock_ai.py       # モックAIサービス
│       └── session.py       # セッション管理
├── requirements.txt
└── README.md
```

## 今後の拡張

- [ ] 実際のGemini API連携
- [ ] Firestoreとの連携
- [ ] 認証機能の追加
- [ ] ロギングとモニタリング
