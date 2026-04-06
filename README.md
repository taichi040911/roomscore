# 🌙 RoomScore AI

寝室の写真をAIが分析して睡眠環境を100点満点でスコアリングするWebアプリ。

## Stack

- **Next.js 14** (App Router)
- **Supabase** (DB + Auth)
- **Claude Vision API** (画像分析)
- **Tailwind CSS**
- **Vercel** (ホスティング)

## セットアップ

```bash
# 1. 依存パッケージインストール
npm install

# 2. 環境変数設定
cp .env.example .env.local
# → ANTHROPIC_API_KEY, Supabase URL/Keys を記入

# 3. Supabase テーブル作成
# Supabase Dashboard → SQL Editor で supabase/migration.sql を実行

# 4. 開発サーバー起動
npm run dev
```

## Vercel デプロイ

```bash
# Vercel CLIでデプロイ
npx vercel

# 環境変数をVercelに設定
npx vercel env add ANTHROPIC_API_KEY
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add NEXT_PUBLIC_APP_URL
```

## 機能

- 📸 寝室写真アップロード
- 🤖 Claude Vision APIで6カテゴリ分析
- 📊 100点満点スコア + カテゴリ別バー
- 💡 優先度付き改善提案 + おすすめ商品
- 🏷️ 睡眠タイプ診断
- 🖼️ OGP動的画像生成（SNSシェア時にスコア表示）
- 📋 結果コピー / X / LINE シェア
- 🔗 eSleepへの送客CTA
- 💾 分析結果をSupabaseに保存
- 🔗 結果共有ページ（/results/[id]）

## eSleep連携

RoomScoreはeSleep Clinic（esleep-clinic.jp）の集客ファネルとして機能:
1. SNSでRoomScoreがバイラル拡散
2. 結果ページからeSleep記事へ送客
3. eSleep記事内にRoomScore診断バナーを設置
4. 相互送客でトラフィック循環
