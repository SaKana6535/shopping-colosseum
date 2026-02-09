# Shopping Colosseum - Frontend

Next.js (App Router) + TypeScript + Tailwind CSSで構築されたフロントエンド

## セットアップ

### 1. 依存関係のインストール

```bash
cd frontend
npm install
```

### 2. 環境変数の設定（オプション）

`.env.local`ファイルを作成:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## ビルド

```bash
npm run build
npm start
```

## プロジェクト構成

```
frontend/
├── app/
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # メインページ
│   └── globals.css          # グローバルスタイル
├── components/
│   ├── DebateView.tsx       # 議論表示エリア
│   ├── AgentMessage.tsx     # エージェント個別のメッセージ
│   ├── JudgeGauge.tsx       # 購入推奨度ゲージ
│   ├── InputForm.tsx        # ユーザー入力フォーム
│   └── ProductInput.tsx     # 商品URL/名前入力
├── types/
│   └── debate.ts            # 型定義
├── lib/
│   └── api.ts               # API呼び出しユーティリティ
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 機能

- 商品URLとユーザーの悩みを入力
- 3人のAIエージェントによる議論を表示
- AI審判による購入推奨度ゲージ
- ユーザーによる議論への介入

## 使用技術

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SWR** (将来的なデータフェッチング用)
