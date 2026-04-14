import { z } from 'zod'

export const eventDaySchema = z
  .enum(['day1', 'day2', '1日目', '2日目'])
  .transform((value) => (value === '1日目' ? 'day1' : value === '2日目' ? 'day2' : value))

export const eventWeatherModeSchema = z
  .enum(['sunny', 'rainy', '青天', '雨天'])
  .transform((value) => (value === '青天' ? 'sunny' : value === '雨天' ? 'rainy' : value))

export const festivalEventSchema = z.object({
  id: z.number(),
  day: eventDaySchema.default('day1'),
  weatherMode: eventWeatherModeSchema.default('sunny'),
  time: z.string(),
  title: z.string(),
  location: z.string(),
  description: z.string(),
  // 旧データ互換のため残す。UIでは現在時刻から動的判定する。
  isNow: z.boolean().optional(),
})

export const festivalEventListSchema = z.array(festivalEventSchema)

export type FestivalEvent = z.infer<typeof festivalEventSchema>
