import type { CafeteriaId, WeekMenu } from '../types'

export function kstToday(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function periodLabel(start?: string, end?: string, today = kstToday()): string {
  if (!start || !end) return '적용 날짜 확인 필요'
  return today < start ? '예정 식단' : today > end ? '기간 지난 식단' : '현재 적용 식단'
}

export function renderMenuStatus(week: WeekMenu, id: CafeteriaId, available: boolean): string {
  const meta = week.menuMeta?.[id]
  const period = meta?.periodStart && meta?.periodEnd ? `${meta.periodStart} ~ ${meta.periodEnd}` : '원문에서 적용 날짜를 확인해 주세요.'
  const fetched = meta?.fetchedAt ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(meta.fetchedAt)) + ' (한국 시간)' : '수집 시각 기록 없음'
  const warning = meta?.fetchStatus === 'failed' ? '최근 수집 실패 · 이전 자료를 유지합니다.' : meta?.isFallback ? '이전 게시물 대체 자료 · 최신 여부를 확인해 주세요.' : ''
  return `<div class="px-5 py-3 border-b border-slate-100 bg-slate-50 text-sm leading-relaxed" data-menu-status>
    <p class="font-semibold text-slate-800">${available ? periodLabel(meta?.periodStart, meta?.periodEnd) : '식단 자료 없음'}</p>
    <p class="text-slate-600">${period}</p><p class="text-slate-500">자료 수집: ${fetched}</p>
    ${warning ? `<p class="text-amber-800">${warning}</p>` : ''}
  </div>`
}
