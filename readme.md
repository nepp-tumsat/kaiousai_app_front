# 海王祭 Web アプリ

東京海洋大学 海王祭のインタラクティブマップとタイムテーブルを提供する Web アプリです（Next.js）。

## 技術スタック

- React 18 + TypeScript
- Next.js 14（App Router）
- Leaflet / react-leaflet
- Zod（マスタデータの検証）

## リポジトリ構成（モノレポ・ディレクトリ分割）

単一リポジトリ内で、次の責務に分けています。

| 領域 | 役割 | 置き場 |
|------|------|--------|
| **Presentation** | ページ・機能 UI。初心者は主にここ | [`src/app/`](src/app/), [`src/features/`](src/features/) |
| **Data access** | `generated` を読み、**アプリが使うデータ API** | [`src/data/loaders.ts`](src/data/loaders.ts) |
| **Contract** | JSON の形の定義（単一の真実） | [`src/data/schema/`](src/data/schema/) |
| **Pipeline** | 外部データの検証・`generated` への書き出し | [`scripts/ingest.ts`](scripts/ingest.ts), [`scripts/sources/`](scripts/sources/) |
| **ビルド成果物** | バンドルに同梱する JSON | [`src/data/generated/`](src/data/generated/) |

`features` や `app` から **`src/data/generated/*.json` を直接 import しない**でください。必ず **`getShops()` / `getEvents()`**（[`loaders.ts`](src/data/loaders.ts)）経由です。

## 開発

### セットアップ

```bash
npm install
```

### 開発サーバー

```bash
npm run dev
```

### リント

```bash
npm run lint
```

### ビルド

```bash
npm run build
```

`prebuild` で `npm run ingest` が走り、`scripts/sources` の JSON を検証して `src/data/generated` を更新してから Next をビルドします。静的書き出し（`output: 'export'`）の結果は **`out/`** に出力されます。

GitHub Pages 用にサブパス配信する場合は CI で `NEXT_PUBLIC_BASE_PATH` を設定しています。ローカルのみでは未設定でルート `/` として動きます。

### プレビュー（本番相当）

```bash
npm run preview
```

## データパイプライン

マスタデータは **リポジトリ内の JSON（生成物）をビルドに同梱**します。本番で DB や HTTP API からマスタを取りません。

1. **編集**: [`scripts/sources/`](scripts/sources/) の `shops.json` / `events.json` を更新する（Google Sheets からエクスポートしたものを置く想定。詳細は [scripts/sources/README.md](scripts/sources/README.md)）。
2. **取り込み**: ルートで `npm run ingest` を実行する。Zod で検証済みの内容が [`src/data/generated/`](src/data/generated/) に書き出されます。
3. **ビルド**: `npm run build`（または `prebuild` 付きで自動）。

**取り込み実装**は Node（`tsx` + TypeScript）です。Go に置き換える場合は、同じ入力・出力（`scripts/sources` → 検証 → `generated`）を満たす CLI に差し替えればよいです。

## コントリビューション

担当分界と「触る範囲」は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 画像・静的アセット

例:

- `public/images/map/campus-map.png` — 学内マップオーバーレイ
- `public/images/shops/` — 模擬店画像（`shops.json` の `image` は `shops/ファイル名` 形式）

## ライセンス

このプロジェクトは提案用プロトタイプ（MVP）です。
