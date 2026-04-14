# データソース（編集用）

ここに置いた JSON を `npm run ingest` が検証し、`src/data/generated/` に書き出します。

- `shops.json` — 模擬店・マップピン用
- `events.json` — タイムテーブル用

Google Sheets からエクスポートする場合は、**このディレクトリの形に合わせて**列をマッピングするか、スプレッドシート用のエクスポートスクリプトを別途用意してください。フィールドを増やすときは `src/data/schema/` の Zod 定義も更新が必要です。

**店舗画像**: ファイルは `public/images/shops/` に置き、`shops.json` の `image` には `public/images/` からの相対パスを書く（例: `shops/yakisoba.jpg`）。マップ用の画像は `public/images/map/` に置く。
