# Shopping Colosseum - セットアップガイド

このガイドに従って、Shopping Colosseumをローカル環境で起動してください。

## 前提条件

以下がインストールされていることを確認してください:

- **Node.js** 22.x以上
- **Python** 3.11以上
- **npm** または **yarn**
- **Git**

## ステップ1: リポジトリのクローン

```bash
git clone <repository-url>
cd shopping-colosseum
```

## ステップ2: Backend のセットアップ

### 2.1 仮想環境の作成

```bash
cd backend
python -m venv venv
```

### 2.2 仮想環境の有効化

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```cmd
venv\Scripts\activate
```

### 2.3 依存関係のインストール

```bash
pip install -r requirements.txt
```

### 2.4 環境変数の設定（オプション）

```bash
cp .env.example .env
# 必要に応じて .env を編集
```

### 2.5 サーバーの起動確認

```bash
uvicorn app.main:app --reload --port 8000
```

ブラウザで http://localhost:8000/docs にアクセスして、API ドキュメントが表示されることを確認してください。

## ステップ3: Frontend のセットアップ

新しいターミナルを開いて、以下を実行します。

### 3.1 依存関係のインストール

```bash
cd frontend
npm install
```

### 3.2 環境変数の設定（オプション）

```bash
cp .env.example .env.local
# 必要に応じて .env.local を編集
```

### 3.3 サーバーの起動確認

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスして、アプリケーションが表示されることを確認してください。

## ステップ4: 動作確認

### 4.1 Backend が起動していることを確認

ターミナル1:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

以下のように表示されればOK:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 4.2 Frontend が起動していることを確認

ターミナル2:
```bash
cd frontend
npm run dev
```

以下のように表示されればOK:
```
- Local:        http://localhost:3000
```

### 4.3 アプリケーションのテスト

1. ブラウザで http://localhost:3000 にアクセス
2. 以下を入力:
   - **商品URL**: `https://example.com/product`
   - **あなたの悩み**: `この商品を買うべきか悩んでいます`
3. 「議論を開始する」をクリック
4. 3人のAIエージェントの議論が表示される
5. 購入推奨ゲージが表示される
6. 「次のターンへ進む」または「議論に介入する」をクリック

## トラブルシューティング

### Backend が起動しない

**問題:** `ModuleNotFoundError: No module named 'fastapi'`

**解決策:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend が起動しない

**問題:** `Error: Cannot find module ...`

**解決策:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS エラーが発生する

**問題:** ブラウザのコンソールに CORS エラーが表示される

**解決策:** 
- Backend の `app/main.py` で CORS 設定を確認
- Frontend の `.env.local` で `NEXT_PUBLIC_API_URL=http://localhost:8000` が設定されているか確認

### ポートが既に使用されている

**問題:** `Address already in use`

**解決策:**
```bash
# Backend (ポート8000)
lsof -ti:8000 | xargs kill -9

# Frontend (ポート3000)
lsof -ti:3000 | xargs kill -9
```

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照してください:

- [README.md](README.md) - プロジェクト概要
- [docs/document.md](docs/document.md) - 詳細設計書
- [backend/README.md](backend/README.md) - Backend 詳細
- [frontend/README.md](frontend/README.md) - Frontend 詳細

## 開発Tips

### ホットリロード

両サーバーともファイル変更時に自動的にリロードされます。

### API ドキュメント

FastAPI の自動生成ドキュメント:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### デバッグ

**Backend:**
- `print()` デバッグ出力はターミナルに表示されます
- VSCode のデバッガーも使用可能

**Frontend:**
- ブラウザの開発者ツールを使用
- `console.log()` で変数を確認

## まとめ

これで Shopping Colosseum のローカル開発環境が整いました！

何か問題が発生した場合は、[トラブルシューティング](#トラブルシューティング) セクションを確認してください。
