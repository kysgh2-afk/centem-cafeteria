export type CafeteriaId = 'stx' | 'partibox' | 'dawa' | 'manna'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export type MealType = 'lunch' | 'dinner'

export interface MealPrice {
  lunch: number
  dinner?: number
}

export interface Cafeteria {
  id: CafeteriaId
  name: string
  shortName: string
  building: string
  address: string
  landmark: string
  floor: string
  prices: MealPrice
  hours: {
    lunch: string
    dinner?: string
    breakTime?: string
  }
  notes?: string
  parkingInfo?: string
  tips?: string[]
  perks?: string[]
  mapQuery: string
  color: string
}

export interface MealMenu {
  main: string
  sides?: string[]
  special?: string
}

export interface DayMenu {
  lunch: MealMenu
  dinner?: MealMenu | null
}

export interface WeekMenu {
  weekStart: string
  weekEnd: string
  title: string
  sourceUrl?: string
  updatedAt: string
  menus: Record<CafeteriaId, Record<DayKey, DayMenu>>
  menuImages?: Partial<Record<CafeteriaId, string>>
}

export interface WeekIndexEntry {
  id: string
  weekStart: string
  weekEnd: string
  title: string
}

export interface WeekIndex {
  currentWeekId: string
  weeks: WeekIndexEntry[]
}

export interface CafeteriaData {
  cafeterias: Cafeteria[]
}

export interface AppData {
  cafeterias: Cafeteria[]
  week: WeekMenu
  weekIndex: WeekIndex
}
