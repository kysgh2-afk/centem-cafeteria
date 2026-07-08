import type { Cafeteria } from '../types'
import { partiboxGuidePagePath } from '../content/partiboxGuide'
import { stxGuidePagePath } from '../content/stxGuide'

const defaultGuidePages: Partial<Record<Cafeteria['id'], string>> = {
  partibox: partiboxGuidePagePath,
  stx: stxGuidePagePath,
}

export function getGuidePage(cafeteria: Cafeteria): string | undefined {
  return cafeteria.guidePage ?? defaultGuidePages[cafeteria.id]
}
