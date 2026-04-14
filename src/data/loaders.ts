import rawEvents from './generated/events.json'
import rawShops from './generated/shops.json'
import { festivalEventListSchema, type FestivalEvent } from './schema/event'
import { shopListSchema, type Shop } from './schema/shop'

export type { FestivalEvent, Shop, ShopCategory } from './schema'

let cachedShops: Shop[] | null = null
let cachedEvents: FestivalEvent[] | null = null

/** 模擬店・ピン用データ（Zod で検証済み） */
export function getShops(): Shop[] {
  if (cachedShops === null) {
    cachedShops = shopListSchema.parse(rawShops)
  }
  return cachedShops
}

/** タイムテーブル用データ（Zod で検証済み） */
export function getEvents(): FestivalEvent[] {
  if (cachedEvents === null) {
    cachedEvents = festivalEventListSchema.parse(rawEvents)
  }
  return cachedEvents
}
