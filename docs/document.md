# Product Design Document: Shopping Colosseum

## 1. プロジェクト概要

**Shopping Colosseum** は、ユーザーの買い物に関する悩み（商品URLや商品名）に対し、3人のAIエージェントが**Google検索で得たリアルタイム情報**を元に議論を行い、決断をサポートするWebアプリケーションである。

**主な特徴:**

* **Multi-Agent Debate:** 性格の異なる3人のAIが、最新の価格やレビューを元に議論する。
* **AI Judge:** 議論の各ターン終了時に、AI審判が「購入推奨度（0-100%）」を判定し、UI上のゲージを変動させる。
* **User Intervention:** ユーザーは議論の途中で「予算無視」「デザイン重視」などの指示を出し、エージェントのスタンスを動的に変化させることができる。

---

## 2. 技術スタック要件

以下の技術スタックを厳守すること。

### A. Frontend

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State/API:** Vercel AI SDK (React) / SWR or React Query
* **Deployment:** Google Cloud Run (Containerized)

### B. Backend

* **Framework:** Python (FastAPI)
* **AI SDK:** Vertex AI SDK for Python (`google-cloud-aiplatform`)
* **Model:** Gemini 1.5 Pro / Flash
* **Grounding:** Vertex AI Search (Grounding with Google Search)
* **Deployment:** Google Cloud Run (Containerized)

### C. Infrastructure & Data

* **Platform:** Google Cloud
* **Database:** Firestore (Native Mode) - 議論ログの保存用（NoSQL）

---

## 3. システムアーキテクチャ

システムは **Frontend (Next.js)** と **Backend (FastAPI)** の分離構成とし、両者をCloud Run上で稼働させる。

### データフロー

1. **User Input:** Frontendから `POST /api/chat` へ商品情報とユーザーの悩みを送信。
2. **Information Retrieval:** Backend (Vertex AI) が **Google Search Grounding** を利用して商品情報を検索。
3. **Debate Generation:** 検索結果を含めたプロンプトをGeminiに投げ、3人のエージェントによる対話を生成。
4. **Judging:** 生成された対話を別のGeminiインスタンス（Judge）が解析し、全体の「購入推奨スコア(0-100)」を算出。
5. **Response:** 対話テキストとスコアをJSON形式でFrontendに返却。
6. **Rendering:** Frontendがチャット形式で対話を表示し、ゲージアニメーションを更新。

---

## 4. 機能要件とロジック

### Feature 1: マルチエージェント議論 (Debate Logic)

* **役割:** 3人のエージェント（例：論理派、感情派、慎重派）が、それぞれ異なる視点から商品を評価する。
* **入力:** 商品情報、これまでの会話履歴、ユーザーからの追加指示。
* **処理:** Geminiに対し、Google検索結果をコンテキストとして与え、**1回のリクエストで3人分の発言**を生成させる（レイテンシ削減のため）。
* **制約:** 嘘の情報（ハルシネーション）を防ぐため、可能な限りGroundingされた情報に基づくこと。

### Feature 2: AI審判とゲージ変動 (The Judge)

* **役割:** 議論の「流れ」を数値化する。個別のエージェントの点数ではなく、**場全体の空気感**を判定する。
* **タイミング:** 各ターン（議論生成）の直後に実行。
* **出力:**
* `score`: 0（絶対買うな）〜 50（中立）〜 100（絶対買え）。
* `reason`: なぜその点数になったかの短い解説。



### Feature 3: インタラクティブな介入 (User Intervention)

* **役割:** ユーザーが議論の方向性を修正する。
* **フロー:**
1. 1ターン（AIたちの発言）が終了し、描画が終わる。
2. ユーザーに入力フォームが表示される。
3. ユーザーが指示（例：「音質についてもっと詳しく」）を入力。
4. Backendはこの指示を**「絶対的な命令」**としてコンテキストに追加し、次のターンを生成する。
5. エージェントはこれまでの主張と矛盾しても、ユーザーの指示に従う形で議論を再開する。



---

## 5. API インターフェース設計 (概略)

### `POST /api/debate/start`

* **Request:** `{ "product_url": string, "user_query": string, "agents_template": string }`
* **Response:** `session_id`, `initial_debate_content`, `judge_result`

### `POST /api/debate/next_turn`

* **Request:** `{ "session_id": string, "user_intervention": string (optional), "history": list }`
* **Response:** `debate_content`, `judge_result`

---

## 6. データモデル設計 (JSON Schema)

BackendからFrontendへ返すレスポンスの構造。

```json
{
  "turn_id": 1,
  "debate": [
    {
      "agent_name": "Mr. Logic",
      "role": "logical",
      "content": "スペックを見る限り、この価格でこのCPU性能は破格です。ベンチマークスコアも..."
    },
    {
      "agent_name": "Ms. Emotion",
      "role": "emotional",
      "content": "でもデザインが野暮ったくない？毎日使うものだからテンション上がる見た目がいいな。"
    },
    {
      "agent_name": "Dr. Risk",
      "role": "critical",
      "content": "待ってください。排熱処理に問題があるというレビューが散見されます。夏場は危険かも。"
    }
  ],
  "judge": {
    "score": 45,
    "reason": "性能は評価されたが、排熱問題とデザインへの不満により、購入には慎重な姿勢が優勢。"
  }
}

```

---

## 7. プロンプトエンジニアリング指針

開発時は以下のSystem Prompt方針を採用すること。

1. **Debate Prompt:** 「あなたは3人の人格を演じ分けるAIです。Google検索ツールで得た情報を元に、以下の商品を議論してください。ユーザーからの介入があった場合は、即座に議論の方向性を修正してください。」
2. **Judge Prompt:** 「あなたは公正な裁判官です。直前の議論を読み、購買意欲がどの程度高まったか、0〜100のスコアで判定してください。50を中立とします。」

---

## 8. 開発のゴール

この設計書に基づき、**Next.jsとFastAPIが連携し、Vertex AIがGoogle検索を行いながら議論を進めるMVP（Minimum Viable Product）** を構築すること。詳細なエラーハンドリングよりも、正常系の「体験（Wow要素）」の実装を優先する。