# syasho-syogi

社長将棋 & ゴブレットゴブラーズ — オンライン対戦ボードゲームプラットフォーム

## ディレクトリ構造

```
syasho-syogi/
├── api/
│   ├── syasho-syogi/        # 社長将棋 API（Express + Prisma + PostgreSQL）
│   └── gobblet-gobblers/    # ゴブレットゴブラーズ API（Express + Prisma + PostgreSQL）
├── web/
│   ├── syasho-syogi/        # 社長将棋 Web（Vue3 + Vite）
│   └── gobblet-gobblers/    # ゴブレットゴブラーズ Web（Vue3 + Vite）
├── docker-compose.yml       # 全サービス定義（DB x2 + API x2 + Web x2）
└── .github/workflows/
    └── deploy.yml           # CI/CD（GHCR push → EC2 deploy）
```

## アプリ一覧

| アプリ | API ポート | Web ポート | DB |
|--------|-----------|-----------|-----|
| 社長将棋 | 3000 | 80 | PostgreSQL (5432) |
| ゴブレットゴブラーズ | 3001 | 8080 | PostgreSQL (5433) |

## ローカル開発

```bash
# 各アプリのAPIを起動
cd api/syasho-syogi && npm install && npm run dev
cd api/gobblet-gobblers && npm install && npm run dev

# 各アプリのWebを起動
cd web/syasho-syogi && npm install && npm run dev
cd web/gobblet-gobblers && npm install && npm run dev
```

## デプロイ

`main` ブランチにpushすると GitHub Actions が自動で:
1. 4つのDockerイメージをビルド → GHCR にpush
2. EC2にSSH接続 → docker compose でデプロイ
