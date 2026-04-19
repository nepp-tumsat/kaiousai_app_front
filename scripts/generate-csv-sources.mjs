/**
 * 一度きり: scripts/sources の JSON から csv 初期ファイルを生成する。
 * 実行: node scripts/generate-csv-sources.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const sources = join(root, 'scripts/sources')
const csvDir = join(sources, 'csv')
mkdirSync(csvDir, { recursive: true })

function esc(s) {
  if (/[",\n\r]/.test(s)) return `"${String(s).replace(/"/g, '""')}"`
  return String(s)
}

function row(cells) {
  return cells.map(esc).join(',') + '\n'
}

/** area 表示名 → areas.csv の id */
const areaIdByName = {
  屋外メイン: 'outdoor_main',
  講義棟: 'lecture',
  体育館: 'gym',
  中庭: 'courtyard',
  キャンパス: 'campus',
  模擬店エリア: 'mogiten',
}

/** (area名, location名) → locations.csv の id */
const locationKey = (a, l) => `${a}||${l}`
const locationIdByKey = {
  [locationKey('屋外メイン', 'メインステージ')]: 'loc_main_stage',
  [locationKey('講義棟', '海象系研究室')]: 'loc_lecture_lab',
  [locationKey('講義棟', '情報系教室')]: 'loc_lecture_info',
  [locationKey('講義棟', '大講義室')]: 'loc_lecture_hall',
  [locationKey('講義棟', '大会議室')]: 'loc_lecture_conf',
  [locationKey('体育館', 'メインアリーナ')]: 'loc_gym',
  [locationKey('中庭', '特設ステージ')]: 'loc_court',
  [locationKey('キャンパス', '模擬店エリア')]: 'loc_campus_mogi',
  [locationKey('模擬店エリア', '屋台ブース')]: 'loc_shop_yakisoba',
  [locationKey('講義棟', '体験コーナー')]: 'loc_shop_nepp',
  [locationKey('屋外メイン', 'メインステージ付近')]: 'loc_shop_stage',
}

const areasCsv = [
  row(['id', 'name', 'center_lat', 'center_lng', 'building']),
  row(['outdoor_main', '屋外メイン', '', '', 'false']),
  row(['lecture', '講義棟', '', '', 'true']),
  row(['gym', '体育館', '', '', 'true']),
  row(['courtyard', '中庭', '', '', 'false']),
  row(['campus', 'キャンパス', '', '', 'false']),
  row(['mogiten', '模擬店エリア', '', '', 'false']),
].join('')

const locMeta = [
  {
    id: 'loc_main_stage',
    area_id: 'outdoor_main',
    name: 'メインステージ',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.6674014773522,
    lng: 139.79056767696503,
    image: '',
    on_map: 'false',
    categories: '',
  },
  {
    id: 'loc_lecture_lab',
    area_id: 'lecture',
    name: '海象系研究室',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.667000819208205,
    lng: 139.79263818382944,
    image: '',
    on_map: 'false',
    categories: '',
  },
  {
    id: 'loc_lecture_info',
    area_id: 'lecture',
    name: '情報系教室',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.667000819208205,
    lng: 139.79263818382944,
    image: '',
    on_map: 'false',
    categories: '',
  },
  {
    id: 'loc_lecture_hall',
    area_id: 'lecture',
    name: '大講義室',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.667000819208205,
    lng: 139.79263818382944,
    image: '',
    on_map: 'false',
    categories: '',
  },
  {
    id: 'loc_lecture_conf',
    area_id: 'lecture',
    name: '大会議室',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.667000819208205,
    lng: 139.79263818382944,
    image: '',
    on_map: 'false',
    categories: '',
  },
  {
    id: 'loc_gym',
    area_id: 'gym',
    name: 'メインアリーナ',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.6674014773522,
    lng: 139.79056767696503,
    image: '',
    on_map: 'false',
    categories: '',
  },
  {
    id: 'loc_court',
    area_id: 'courtyard',
    name: '特設ステージ',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.6675,
    lng: 139.7905,
    image: '',
    on_map: 'false',
    categories: '',
  },
  {
    id: 'loc_campus_mogi',
    area_id: 'campus',
    name: '模擬店エリア',
    display_title: '',
    description: '',
    organization: '',
    lat: 35.66751236917332,
    lng: 139.79109988158692,
    image: '',
    on_map: 'false',
    categories: '',
  },
]

const shops = JSON.parse(readFileSync(join(sources, 'shops.json'), 'utf8'))
for (const s of shops) {
  const aid = areaIdByName[s.area]
  if (!aid) throw new Error(`unknown area ${s.area}`)
  const key = locationKey(s.area, s.location)
  const id = locationIdByKey[key]
  if (!id) throw new Error(`no location id for shop key ${key}`)
  locMeta.push({
    id,
    area_id: aid,
    name: s.location,
    display_title: s.title,
    description: s.description,
    organization: s.organization,
    lat: s.coordinates[0],
    lng: s.coordinates[1],
    image: s.image,
    on_map: 'true',
    categories: s.category,
  })
}

const locHeader = [
  'id',
  'area_id',
  'name',
  'display_title',
  'description',
  'organization',
  'lat',
  'lng',
  'image',
  'on_map',
  'categories',
]
let locationsCsv = row(locHeader)
for (const L of locMeta) {
  locationsCsv += row([
    L.id,
    L.area_id,
    L.name,
    L.display_title,
    L.description,
    L.organization,
    String(L.lat),
    String(L.lng),
    L.image,
    L.on_map,
    L.categories,
  ])
}

const events = JSON.parse(readFileSync(join(sources, 'events.json'), 'utf8'))
const evHeader = [
  'id',
  'location_id',
  'title',
  'organization',
  'description',
  'start_time',
  'end_time',
  'weather_mode',
  'published',
  'image',
]
let eventsCsv = row(evHeader)
let n = 0
for (const e of events) {
  n += 1
  const lid = locationIdByKey[locationKey(e.area, e.location)]
  if (!lid) throw new Error(`no location for ${e.area} / ${e.location}`)
  const wm = e.weatherMode === '' ? 'both' : e.weatherMode
  const startIso = `${e.day}T${e.startTime}:00+09:00`
  const endIso = `${e.day}T${e.endTime}:00+09:00`
  eventsCsv += row([
    `ev_${n}`,
    lid,
    e.title,
    e.organization ?? '',
    e.description,
    startIso,
    endIso,
    wm,
    e.published ? 'true' : 'false',
    e.image,
  ])
}

writeFileSync(join(csvDir, 'areas.csv'), areasCsv, 'utf8')
writeFileSync(join(csvDir, 'locations.csv'), locationsCsv, 'utf8')
writeFileSync(join(csvDir, 'events.csv'), eventsCsv, 'utf8')
console.log('wrote scripts/sources/csv/*.csv')
