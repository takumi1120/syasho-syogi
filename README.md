# syasho-syogi

社長将棋 & ゴブレットゴブラーズ — オンライン対戦ボードゲームプラットフォーム

## アーキテクチャ

1つのAPIコンテナ + 1つのWebコンテナで複数ゲームを配信。

```
syasho-syogi/
├── api/                         # 統合APIサーバー（1コンテナ）
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   ├── syasho-syogi/        # 社長将棋DB スキーマ
│   │   └── gobblet-gobblers/    # ゴブレットDB スキーマ
│   └── src/
│       ├── server.ts            # 統合エントリポイント
│       ├── syasho-syogi/        # 社長将棋 ルート・ロジック
│       └── gobblet-gobblers/    # ゴブレット ルート・ロジック
├── web/                         # 統合Webサーバー（1コンテナ）
│   ├── Dockerfile               # マルチステージ: 両アプリビルド→nginx
│   ├── nginx.conf
│   ├── syasho-syogi/            # 社長将棋 Vue3アプリ
│   └── gobblet-gobblers/        # ゴブレット Vue3アプリ
├── docker-compose.yml           # 4サービス（DB x2 + API x1 + Web x1）
└── .github/workflows/deploy.yml
```

## エンドポイント

| パス | 内容 |
|------|------|
| `http://host/syasho-syogi/` | 社長将棋 Web |
| `http://host/gobblet-gobblers/` | ゴブレット Web |
| `http://host:3000/syasho-syogi/*` | 社長将棋 API |
| `http://host:3000/gobblet-gobblers/*` | ゴブレット API |

## ローカル開発

```bash
# API（統合サーバー）
cd api && npm install && npm run prisma:generate && npm run dev

# Web（個別に起動）
cd web/syasho-syogi && npm install && npm run dev
cd web/gobblet-gobblers && npm install && npm run dev
```

## デプロイ

`main` ブランチにpushすると GitHub Actions が自動で:
1. APIイメージ + Webイメージの2つをビルド → GHCR にpush
2. EC2にSSH接続 → Prisma migrate（両スキーマ） → docker compose でデプロイ
