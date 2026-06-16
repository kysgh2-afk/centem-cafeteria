import type { AppData, CafeteriaData, DayKey, WeekIndex, WeekMenu } from '../types'

const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri']

export const DAY_LABELS: Record<DayKey, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
}

export { DAY_KEYS }

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

export function getTodayDayKey(date = new Date()): DayKey | null {
  const day = date.getDay()
  const map: Record<number, DayKey | null> = {
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    0: null,
    6: null,
  }
  return map[day] ?? null
}

export function isDateInWeek(date: Date, weekStart: string, weekEnd: string): boolean {
  const d = date.toISOString().slice(0, 10)
  return d >= weekStart && d <= weekEnd
}

export function mapSearchUrl(query: string): string {
  return `https://map.kakao.com/?q=${encodeURIComponent(query)}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function fetchAppData(weekId?: string): Promise<AppData> {
  const [cafeteriaData, weekIndex] = await Promise.all([
    fetchJson<CafeteriaData>('/data/cafeterias.json'),
    fetchJson<WeekIndex>('/data/weeks/index.json'),
  ])

  const targetWeekId = weekId ?? weekIndex.currentWeekId
  const week = await fetchJson<WeekMenu>(`/data/weeks/${targetWeekId}.json`)

  return {
    cafeterias: cafeteriaData.cafeterias,
    week,
    weekIndex,
  }
}

export async function fetchWeekMenu(weekId: string): Promise<WeekMenu> {
  return fetchJson<WeekMenu>(`/data/weeks/${weekId}.json`)
}
