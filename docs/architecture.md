# Shopping Colosseum - システムアーキテクチャ図 作成用資料

## 1. システム全体像

Shopping Colosseum は、複数のAIエージェントが商品の購入について多角的に議論し、AI審判が購入推奨度を判定するWebアプリケーション。
フロントエンドとバックエンドを **1コンテナ** にまとめ、Google Cloud Run 上で稼働する構成。

---

## 2. アクター（利用者）

| アクター | 説明 | 図中の位置 |
|----------|------|------------|
| **エンジニア（開発者）** | コードをGitHubにPushしデプロイをトリガーする | 左上 |
| **一般ユーザー** | ブラウザからアプリにアクセスし、商品URLと質問を入力する | 左側 |

---

## 3. CI/CD パイプライン

```
エンジニア → Push → GitHub → gcloud run deploy --source . → Cloud Build → Artifact Registry → Cloud Run にデプロイ
```

| ステップ | サービス | 説明 |
|----------|----------|------|
| 1. コードPush | **GitHub** | ソースコードのバージョン管理 |
| 2. デプロイコマンド | **gcloud CLI** | `gcloud run deploy --source .` でデプロイ実行 |
| 3. コンテナビルド | **Cloud Build** | Dockerfile に基づきマルチステージビルドを実行 |
| 4. イメージ保存 | **Artifact Registry** | ビルドされたDockerイメージを保管 |
| 5. デプロイ | **Cloud Run** | コンテナイメージをデプロイ・起動 |

> **注記**: 現在 GitHub Actions は未導入。手動で `gcloud run deploy` を実行する運用。

---

## 4. フロントエンド

| 項目 | 内容 |
|------|------|
| **フレームワーク** | Next.js 14 (App Router) |
| **言語** | TypeScript |
| **スタイリング** | Tailwind CSS |
| **状態管理** | React Hooks (useState/useEffect) |
| **ビルド方式** | 静的エクスポート (`output: 'export'`) |
| **配信方法** | FastAPI の StaticFiles ミドルウェアで配信（1コンテナ構成） |
| **ホスティング** | Cloud Run（バックエンドと同一コンテナ） |

### 主要ページ・コンポーネント

- `/` - メインページ（ディベート作成・実行）
- `/debate?id=<session_id>` - ディベートログ詳細表示
- 16個のReactコンポーネント（AgentMessage, JudgeGauge, ThinkingView 等）

---

## 5. バックエンド

| 項目 | 内容 |
|------|------|
| **フレームワーク** | FastAPI |
| **言語** | Python 3.11+ |
| **データモデル** | Pydantic v2 |
| **サーバー** | Uvicorn |
| **ホスティング** | Google Cloud Run |
| **コンテナ** | Docker (python:3.11-slim) |
| **メモリ** | 512Mi |

### APIエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/health` | ヘルスチェック |
| POST | `/api/debate/start` | ディベート開始（セッション作成 + 第1ターン生成） |
| POST | `/api/debate/next_turn` | 次のターン生成（ユーザー介入オプション付き） |
| GET | `/api/debate/logs` | ディベートログ一覧取得 |
| GET | `/api/debate/logs/{session_id}` | ディベートログ詳細取得 |
| DELETE | `/api/debate/logs/{session_id}` | ディベートログ削除 |

---

## 6. データベース

| 項目 | 内容 |
|------|------|
| **サービス** | Google Cloud Firestore |
| **利用方式** | オプション（`FIRESTORE_ENABLED` で有効/無効切替） |
| **コレクション名** | `debates`（設定可能） |
| **フォールバック** | インメモリセッション管理（Firestore無効時） |

### Firestore ドキュメント構造

```json
{
  "session_id": "string",
  "product_url": "string",
  "user_query": "string",
  "selected_agents": ["logical", "emotional", "critical"],
  "current_turn": 3,
  "history": [
    {
      "turn_id": 1,
      "debate": [
        { "agent_name": "Mr. Logic", "role": "logical", "content": "..." }
      ],
      "judge": { "score": 65, "reason": "..." }
    }
  ],
  "title": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 7. AI サービス（議論生成エンジン）

### 7-1. 議論生成Agent

| 項目 | 内容 |
|------|------|
| **AIモデル** | Google Gemini 2.0 Flash |
| **API** | Vertex AI (vertexai SDK) |
| **出力形式** | 構造化JSON（OpenAPI 3.0 スキーマ指定） |
| **Temperature** | 0.8（創造性重視） |
| **機能** | 選択されたエージェントのロールに基づき議論を生成 |

#### 10種類のAIエージェント

| ロール名 | キャラクター名 | ラベル | 観点 |
|----------|---------------|--------|------|
| logical | Mr. Logic | 論理派 | データ・スペック・コスパ |
| emotional | Ms. Emotion | 感情派 | デザイン・感情・ワクワク感 |
| critical | Dr. Risk | 慎重派 | リスク・懸念点 |
| cost_conscious | Mr. Budget | コスト重視派 | 価格・費用対効果 |
| eco_friendly | Ms. Green | エコ派 | 環境・サステナビリティ |
| aesthetic | Ms. Design | デザイン派 | 見た目・美的価値 |
| practical | Mr. Practical | 実用派 | 使い勝手・メンテナンス性 |
| data_driven | Dr. Data | データ派 | レビューデータ・統計 |
| trendy | Ms. Trend | トレンド派 | 最新トレンド・SNS話題性 |
| social_proof | Mr. Social | 口コミ派 | 購入者レビュー・口コミ |

### 7-2. 審判Agent

| 項目 | 内容 |
|------|------|
| **AIモデル** | Google Gemini 2.0 Flash |
| **API** | Vertex AI (vertexai SDK) |
| **出力形式** | 構造化JSON（スコア + 判定理由） |
| **Temperature** | 0.3（安定性重視） |
| **スコア範囲** | 0〜100（購入推奨度） |

#### スコアリング基準

| スコア | 意味 |
|--------|------|
| 0 | 絶対に買うべきではない |
| 25 | 購入には慎重になるべき |
| 50 | 中立（メリットとデメリットが拮抗） |
| 75 | 購入を前向きに検討すべき |
| 100 | 絶対に買うべき |

### 7-3. 商品リサーチ（Google Search Grounding）

| 項目 | 内容 |
|------|------|
| **API** | Google GenAI SDK (`google-genai`) |
| **機能** | Google Search Grounding |
| **目的** | 商品URL に関するリアルタイム情報をGoogle検索で収集 |
| **キャッシュ** | 同一URLの再検索を防止するインメモリキャッシュ |
| **収集情報** | 商品名・価格帯・スペック・レビュー傾向・競合製品・注意点 |

---

## 8. コンポーネント間の通信フロー

### 8-1. ユーザー利用フロー（メインフロー）

```
ユーザー
  │
  │ ブラウザアクセス
  ▼
[フロントエンド] Next.js (静的HTML/JS/CSS)
  │
  │ REST API (JSON)
  │ POST /api/debate/start
  │ POST /api/debate/next_turn
  ▼
[バックエンド] FastAPI (Cloud Run)
  │
  ├──── データ保存 ───→ [Cloud Firestore]
  │
  ├──── 商品リサーチ ──→ [Gemini 2.0 Flash + Google Search Grounding]
  │                         │
  │                         └── Google検索で商品情報を収集
  │
  ├──── 議論生成 ─────→ [Gemini 2.0 Flash] (Vertex AI)
  │                         │
  │                         └── 構造化JSON出力（エージェント発言）
  │
  └──── 審判スコア ───→ [Gemini 2.0 Flash] (Vertex AI)
                            │
                            └── 構造化JSON出力（スコア + 理由）
```

### 8-2. デプロイフロー（CI/CD）

```
エンジニア
  │
  │ Push
  ▼
[GitHub] リポジトリ
  │
  │ gcloud run deploy --source .
  ▼
[Cloud Build] Dockerイメージビルド
  │
  │ マルチステージビルド:
  │   Stage 1: node:24-alpine → npm run build (Next.js静的エクスポート)
  │   Stage 2: python:3.11-slim → pip install + 静的ファイルコピー
  │
  ├──── イメージ保存 ──→ [Artifact Registry]
  │
  └──── デプロイ ──────→ [Cloud Run]
```

---

## 9. Google Cloud Platform サービス一覧

| サービス | 用途 | リージョン |
|----------|------|------------|
| **Cloud Run** | アプリケーションホスティング（1コンテナ構成） | us-central1 |
| **Cloud Build** | Dockerイメージのビルド | - |
| **Artifact Registry** | Dockerイメージの保管 | - |
| **Cloud Firestore** | 議論ログの永続化（オプション） | - |
| **Vertex AI** | Gemini 2.0 Flash モデルの利用 | us-central1 |
| **Google Search** | 商品情報のリアルタイム検索（Grounding） | global |

---

## 10. Dockerマルチステージビルド構成

| ステージ | ベースイメージ | 役割 | 出力 |
|----------|---------------|------|------|
| `frontend-builder` | `node:24-alpine` | Next.js 静的エクスポート | `out/` ディレクトリ |
| 最終ステージ | `python:3.11-slim` | FastAPI + 静的ファイル配信 | `/app/static` + `/app` |

---

## 11. 環境変数一覧

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `AI_SERVICE_MODE` | AIサービスモード (`mock` / `gemini`) | `mock` |
| `GOOGLE_CLOUD_PROJECT` | GCPプロジェクトID | (空) |
| `VERTEX_AI_LOCATION` | Vertex AI リージョン | `us-central1` |
| `VERTEX_AI_MODEL` | 使用するGeminiモデル | `gemini-2.0-flash` |
| `PORT` | サーバーポート | `8080` (Docker) / `8000` (ローカル) |
| `STATIC_FILES_DIR` | 静的ファイルのパス | (空) |
| `ALLOWED_ORIGINS` | CORS許可オリジン（カンマ区切り） | `http://localhost:3000` |
| `FIRESTORE_ENABLED` | Firestore有効/無効 | `false` |
| `FIRESTORE_COLLECTION` | Firestoreコレクション名 | `debates` |
| `DEBUG` | デバッグモード | `false` |
| `NEXT_PUBLIC_API_URL` | (Frontend) バックエンドAPIのURL | (空) |

---

## 12. アーキテクチャ図の描画ガイド（参考画像のスタイル準拠）

### レイアウト構成

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [エンジニア] ──Push──→ [GitHub] ──gcloud deploy──→ [Cloud Build]          │
│                                                       │                     │
│                                                  Build│   ┌──────────────┐  │
│                                                       ├──→│ Artifact     │  │
│                                                       │   │ Registry     │  │
│                                          Deploy       │   └──────────────┘  │
│  ┌──────────────┐     ┌──────────────────┐◄───────────┘                     │
│  │              │     │                  │         ┌──────────────┐          │
│  │ フロントエンド │     │   バックエンド    │────────→│  データベース  │          │
│  │              │     │                  │ データ  │              │          │
│  │  NEXT.js     │────→│  FastAPI/Python  │ 保存    │Cloud Firestore│         │
│  │  TypeScript  │ API │                  │         │              │          │
│  │              │     │   Cloud Run      │         └──────────────┘          │
│  └──────────────┘     └────────┬─────────┘                                  │
│        ▲                       │                                            │
│        │                       │                                            │
│   [ユーザー]          ┌────────┴────────┐                                   │
│                       │                 │                                    │
│               ┌───────▼───────┐ ┌───────▼──────────┐                        │
│               │ 議論生成Agent  │ │   審判Agent       │                       │
│               │               │ │                  │                        │
│               │  Gemini 2.0   │ │  Gemini 2.0      │                        │
│               │  Flash        │ │  Flash           │                        │
│               │               │ │                  │                        │
│               │  Vertex AI    │ │  Vertex AI       │                        │
│               │ ┌───────────┐ │ └──────────────────┘                        │
│               │ │ Google    │ │                                             │
│               │ │ Search    │ │                                             │
│               │ │ Grounding │ │                                             │
│               │ └───────────┘ │                                             │
│               └───────────────┘                                             │
│                                                                             │
│                        Google Cloud Platform                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 描画時のポイント

1. **全体を囲む枠**: Google Cloud Platform（オレンジ枠で囲む）
2. **アクター**: エンジニアとユーザーは枠の外側に配置
3. **ロゴ/アイコン使用推奨**: GitHub, Next.js, FastAPI/Python, Cloud Firestore, Gemini, Vertex AI, Google Search, Cloud Build, Artifact Registry, Cloud Run
4. **矢印ラベル**: Push, API通信, データ保存, Build, Deploy, 商品リサーチ, 議論生成, 審判スコアリング
5. **色分け**:
   - フロントエンド: 青系
   - バックエンド: 緑系
   - データベース: オレンジ系
   - AIサービス: 紫系
   - CI/CD: グレー系
6. **1コンテナ構成の強調**: フロントエンドとバックエンドが同一Cloud Run内にあることを視覚的に示す

### 参考画像との対応関係

| 参考画像の要素 | Shopping Colosseum での対応 |
|--------------|--------------------------|
| 社会福祉士 | 一般ユーザー |
| エンジニア | エンジニア（同一） |
| GitHub + GitHub Actions | GitHub + gcloud CLI（Actions未導入） |
| Firebase Hosting | Cloud Run（FastAPIで静的ファイル配信） |
| FastAPI / Python + Cloud Run | FastAPI / Python + Cloud Run（同一） |
| Cloud Firestore | Cloud Firestore（同一） |
| アセスメント作成Agent (Gemini+LangChain) | 議論生成Agent (Gemini 2.0 Flash + Vertex AI) |
| 支援提案Agent (Gemini+LangChain) | 審判Agent (Gemini 2.0 Flash + Vertex AI) |
| Vertex.ai (社会支援RAG) | Vertex AI (構造化JSON出力) |
| Google Search API | Google Search Grounding |
| Cloud Build + Artifact Registry | Cloud Build + Artifact Registry（同一） |
