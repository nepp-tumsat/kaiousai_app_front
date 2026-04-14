'use client'

import './Timetable.css'
import { useEffect, useMemo, useState } from 'react'
import { getEvents, type FestivalEvent } from '../../data/loaders'

const FESTIVAL_DATE_BY_DAY: Record<'day1' | 'day2', string> = {
  day1: '2026-05-16',
  day2: '2026-05-17',
}

const dayLabels: Record<'day1' | 'day2', string> = {
  day1: '1日目 (05/16)',
  day2: '2日目 (05/17)',
}

const weatherLabels: Record<'sunny' | 'rainy', string> = {
  sunny: '青天',
  rainy: '雨天',
}

const RED_LINE_START_MINUTES = 9 * 60
const RED_LINE_END_MINUTES = 18 * 60

function parseTimeToMinutes(time: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time.trim())
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour * 60 + minute
}

function nowInJstMinutes(): number {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')
  return hour * 60 + minute
}

function todayInJstIsoDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function getDefaultSelectedDay(): 'day1' | 'day2' {
  const today = todayInJstIsoDate()
  if (today === FESTIVAL_DATE_BY_DAY.day2) return 'day2'
  return 'day1'
}

function formatMinutesAsTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440
  const hour = Math.floor(normalized / 60)
  const minute = normalized % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function getCurrentLineIndex(
  locationEvents: Array<{ startMinutes: number | null }>,
  currentMinutes: number,
): number | null {
  const timedEvents = locationEvents.filter(
    (event): event is { startMinutes: number } => event.startMinutes !== null,
  )
  if (timedEvents.length === 0) return null

  const firstStart = timedEvents[0].startMinutes
  if (currentMinutes < firstStart) return 0

  for (let i = 0; i < timedEvents.length; i += 1) {
    const start = timedEvents[i].startMinutes
    const nextStart = timedEvents[i + 1]?.startMinutes ?? start + 60
    if (currentMinutes >= start && currentMinutes < nextStart) {
      return i + 1
    }
  }

  return timedEvents.length
}

export default function TimetableFeature() {
  const events: FestivalEvent[] = getEvents()
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => nowInJstMinutes())
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2'>(() => getDefaultSelectedDay())
  const [selectedWeather, setSelectedWeather] = useState<'sunny' | 'rainy'>('sunny')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMinutes(nowInJstMinutes())
    }, 60_000)
    return () => clearInterval(timer)
  }, [])

  const eventsWithMinutes = useMemo(
    () =>
      events
        .map((event) => ({
          ...event,
          startMinutes: parseTimeToMinutes(event.time),
        }))
        .sort((a, b) => {
          const aMinutes = a.startMinutes ?? Number.MAX_SAFE_INTEGER
          const bMinutes = b.startMinutes ?? Number.MAX_SAFE_INTEGER
          return aMinutes - bMinutes
        }),
    [events],
  )

  const dayWeatherEvents = useMemo(
    () =>
      eventsWithMinutes.filter(
        (event) => event.day === selectedDay && event.weatherMode === selectedWeather,
      ),
    [eventsWithMinutes, selectedDay, selectedWeather],
  )

  const locations = useMemo(
    () => Array.from(new Set(dayWeatherEvents.map((event) => event.location))),
    [dayWeatherEvents],
  )

  useEffect(() => {
    if (selectedLocation !== 'all' && !locations.includes(selectedLocation)) {
      setSelectedLocation('all')
    }
  }, [locations, selectedLocation])

  const filteredEvents = useMemo(
    () =>
      selectedLocation === 'all'
        ? dayWeatherEvents
        : dayWeatherEvents.filter((event) => event.location === selectedLocation),
    [dayWeatherEvents, selectedLocation],
  )

  const currentEventId = useMemo(() => {
    for (let i = 0; i < filteredEvents.length; i += 1) {
      const event = filteredEvents[i]
      if (event.startMinutes === null) continue
      const next = filteredEvents[i + 1]
      const end = next?.startMinutes ?? event.startMinutes + 60
      if (currentMinutes >= event.startMinutes && currentMinutes < end) {
        return event.id
      }
    }
    return null
  }, [currentMinutes, filteredEvents])

  const groupedByLocation = useMemo(() => {
    const grouped = new Map<string, typeof filteredEvents>()
    filteredEvents.forEach((event) => {
      const list = grouped.get(event.location) ?? []
      list.push(event)
      grouped.set(event.location, list)
    })
    return grouped
  }, [filteredEvents])

  const currentTimeLabel = useMemo(
    () => formatMinutesAsTime(currentMinutes),
    [currentMinutes],
  )
  const shouldShowNowLine =
    currentMinutes >= RED_LINE_START_MINUTES &&
    currentMinutes <= RED_LINE_END_MINUTES

  return (
    <div className="timetable-container">
      <h2>タイムテーブル</h2>
      <p className="timetable-current-time">現在時刻: {currentTimeLabel}</p>
      <div className="timetable-controls">
        <div className="timetable-filter-row">
          {(['day1', 'day2'] as const).map((day) => (
            <button
              key={day}
              type="button"
              className={`timetable-filter-button ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {dayLabels[day]}
            </button>
          ))}
        </div>
        <div className="timetable-filter-row">
          {(['sunny', 'rainy'] as const).map((weather) => (
            <button
              key={weather}
              type="button"
              className={`timetable-filter-button ${selectedWeather === weather ? 'active' : ''}`}
              onClick={() => setSelectedWeather(weather)}
            >
              {weatherLabels[weather]}
            </button>
          ))}
        </div>
        <div className="timetable-filter-row timetable-location-row">
          <button
            type="button"
            className={`timetable-filter-button ${selectedLocation === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedLocation('all')}
          >
            すべての場所
          </button>
          {locations.map((location) => (
            <button
              key={location}
              type="button"
              className={`timetable-filter-button ${selectedLocation === location ? 'active' : ''}`}
              onClick={() => setSelectedLocation(location)}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {groupedByLocation.size === 0 ? (
        <p className="timetable-empty">該当する企画はありません。</p>
      ) : (
        <div className="timetable-group-list">
          {Array.from(groupedByLocation.entries()).map(([location, locationEvents]) => (
            <section key={location} className="timetable-location-group">
              <h3 className="timetable-location-title">{location}</h3>
              <div className="timetable-list">
                {(() => {
                  const currentLineIndex = shouldShowNowLine
                    ? getCurrentLineIndex(locationEvents, currentMinutes)
                    : null
                  return (
                    <>
                      {locationEvents.map((event, index) => (
                        <div key={event.id}>
                          {currentLineIndex === index && (
                            <div className="timetable-now-line" aria-label={`現在時刻 ${currentTimeLabel}`}>
                              <span>{currentTimeLabel}</span>
                            </div>
                          )}
                          <div className={`timetable-item ${currentEventId === event.id ? 'now' : ''}`}>
                            <div className="timetable-time">{event.time}</div>
                            <div className="timetable-content">
                              <h3>{event.title}</h3>
                              {currentEventId === event.id && <span className="now-badge">開催中 (NOW)</span>}
                              <p>{event.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {currentLineIndex === locationEvents.length && (
                        <div className="timetable-now-line" aria-label={`現在時刻 ${currentTimeLabel}`}>
                          <span>{currentTimeLabel}</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

