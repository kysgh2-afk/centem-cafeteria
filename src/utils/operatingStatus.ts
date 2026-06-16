import type { Cafeteria } from '../types'

export type OperatingStatusKind = 'open' | 'break' | 'before-open' | 'closed' | 'weekend'

export interface OperatingStatus {
  kind: OperatingStatusKind
  label: string
  detail?: string
}

function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute
}

function parseTimeRange(text: string): [number, number] | null {
  const match = text.match(/(\d{1,2}):(\d{2})\s*[–\-—]\s*(\d{1,2}):(\d{2})/)
  if (!match) return null

  return [
    toMinutes(Number(match[1]), Number(match[2])),
    toMinutes(Number(match[3]), Number(match[4])),
  ]
}

function isWithin(minutes: number, [start, end]: [number, number]): boolean {
  return minutes >= start && minutes < end
}

function minutesUntilClose(minutes: number, [start, end]: [number, number]): number | null {
  if (!isWithin(minutes, [start, end])) return null
  return end - minutes
}

function getSeoulNow(): { dayOfWeek: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon'
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)

  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  }

  return { dayOfWeek: dayMap[weekday] ?? 1, minutes: toMinutes(hour, minute) }
}

function closingDetail(minutes: number, range: [number, number]): string | undefined {
  const remaining = minutesUntilClose(minutes, range)
  if (remaining === null) return undefined
  if (remaining <= 30) return `${remaining}분 후 마감`
  return undefined
}

export function getOperatingStatus(cafeteria: Cafeteria, now = getSeoulNow()): OperatingStatus {
  const { dayOfWeek, minutes } = now
  const lunchRange = parseTimeRange(cafeteria.hours.lunch)
  const dinnerRange = cafeteria.hours.dinner ? parseTimeRange(cafeteria.hours.dinner) : null
  const breakRange = cafeteria.hours.breakTime ? parseTimeRange(cafeteria.hours.breakTime) : null

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  const isSaturday = dayOfWeek === 6

  if (!isWeekday && !(isSaturday && cafeteria.id === 'partibox')) {
    return { kind: 'weekend', label: '주말 휴무' }
  }

  if (!lunchRange) {
    return { kind: 'closed', label: '영업 정보 없음' }
  }

  if (isWithin(minutes, lunchRange)) {
    return {
      kind: 'open',
      label: '영업 중 · 점심',
      detail: closingDetail(minutes, lunchRange),
    }
  }

  if (dinnerRange && isWithin(minutes, dinnerRange)) {
    return {
      kind: 'open',
      label: '영업 중 · 저녁',
      detail: closingDetail(minutes, dinnerRange),
    }
  }

  if (breakRange && isWithin(minutes, breakRange)) {
    return { kind: 'break', label: '휴식 시간' }
  }

  if (minutes < lunchRange[0]) {
    return { kind: 'before-open', label: '오픈 전' }
  }

  if (dinnerRange && minutes > lunchRange[1] && minutes < dinnerRange[0]) {
    if (breakRange && isWithin(minutes, breakRange)) {
      return { kind: 'break', label: '휴식 시간' }
    }
    return { kind: 'break', label: '점심 마감 · 저녁 대기' }
  }

  return { kind: 'closed', label: '마감' }
}

export function operatingStatusBadgeClass(kind: OperatingStatusKind): string {
  switch (kind) {
    case 'open':
      return 'bg-green-100 text-green-800'
    case 'break':
      return 'bg-amber-100 text-amber-800'
    case 'before-open':
      return 'bg-blue-100 text-blue-800'
    case 'weekend':
    case 'closed':
      return 'bg-slate-100 text-slate-600'
  }
}
