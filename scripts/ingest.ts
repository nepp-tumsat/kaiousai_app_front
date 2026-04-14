/**
 * scripts/sources の JSON を検証し、src/data/generated に書き出す。
 * Google Sheets 等からエクスポートしたファイルを sources に置き、本スクリプトで正規化する。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { festivalEventListSchema } from '../src/data/schema/event'
import { shopListSchema } from '../src/data/schema/shop'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const sourcesDir = join(root, 'scripts/sources')
const outDir = join(root, 'src/data/generated')

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown
}

function writeJson(filename: string, data: unknown): void {
  const text = `${JSON.stringify(data, null, 2)}\n`
  writeFileSync(join(outDir, filename), text, 'utf8')
}

mkdirSync(outDir, { recursive: true })

const shopsRaw = readJson(join(sourcesDir, 'shops.json'))
const shops = shopListSchema.parse(shopsRaw)
writeJson('shops.json', shops)

const eventsRaw = readJson(join(sourcesDir, 'events.json'))
const events = festivalEventListSchema.parse(eventsRaw)
writeJson('events.json', events)

console.log('ingest: wrote src/data/generated/shops.json and events.json')
