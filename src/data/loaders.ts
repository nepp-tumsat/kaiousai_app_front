import rawEvents from './generated/events.json'
import rawMapAreas from './generated/map-areas.json'
import rawShops from './generated/shops.json'
import { festivalEventListSchema, type FestivalEvent } from './schema/event'
import { mapAreasPayloadSchema, type MapAreasPayload } from './schema/mapAreas'
import { shopListSchema, type Shop } from './schema/shop'

export type { FestivalEvent, MapAreasPayload, MapEventLocationPin, Shop, ShopCategory } from './schema'

let cachedShops: Shop[] | null = null
let cachedEvents: FestivalEvent[] | null = null
let cachedMapAreas: MapAreasPayload | null = null

/** 模擬店・ピン用データ（Zod で検証済み） */
export function getShops(): Shop[] {
  if (cachedShops === null) {
    cachedShops = shopListSchema.parse(rawShops)
  }
  return cachedShops
}

/** マップのエリア集約ピン用（`map-areas.json`） */
export function getMapAreas(): MapAreasPayload {
  if (cachedMapAreas === null) {
    cachedMapAreas = mapAreasPayloadSchema.parse(rawMapAreas)
  }
  return cachedMapAreas
}

/** タイムテーブル用データ（公開中のみ。Zod で検証済み） */
export function getEvents(): FestivalEvent[] {
  if (cachedEvents === null) {
    cachedEvents = festivalEventListSchema
      .parse(rawEvents)
      .filter((event) => event.published)
  }
  return cachedEvents
}
