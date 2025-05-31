# シンプルチャットアプリ

2人で使うことを想定したシンプルなリアルタイムチャットアプリケーションです。

## 技術スタック

- **フロントエンド**: React + Vite
- **バックエンド**: Node.js + Express
- **リアルタイム通信**: Socket.IO
- **データベース**: SQLite
- **スタイリング**: CSS

## 機能

- リアルタイムメッセージ送受信
- メッセージ履歴の保存
- タイピング中の表示
- レスポンシブデザイン

## セットアップ

### 必要な環境

- Node.js 18以上
- npm

### インストール

```bash
# 依存関係のインストール
npm run install:all
```

### 環境変数

`.env`ファイルを作成し、以下を設定：

```
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 開発環境での実行

```bash
# サーバーとクライアントを同時に起動
npm run dev
```

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3001

## デプロイ

### Renderへのデプロイ

1. GitHubにリポジトリをプッシュ
2. Renderでアカウントを作成
3. 新しいWeb Serviceを作成
4. GitHubリポジトリを接続
5. 以下の設定を行う：
   - Build Command: `npm run render-build`
   - Start Command: `npm start`
   - Environment Variables:
     - `NODE_ENV`: `production`
     - `CLIENT_URL`: デプロイ後のURL

## ライセンス

ISC
