import type { AppData } from '../types'
import { formatPrice } from '../services/menuService'

export function renderWeekNav(data: AppData, selectedWeekId: string): string {
  const { weeks, currentWeekId } = data.weekIndex
  const currentIndex = weeks.findIndex((w) => w.id === selectedWeekId)
  const hasPrev = currentIndex < weeks.length - 1
  const hasNext = currentIndex > 0

  return `
    <div class="flex items-center justify-between gap-4 mb-6">
      <button
        data-week-nav="prev"
        class="rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
          hasPrev
            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
        }"
        ${hasPrev ? '' : 'disabled'}
      >
        ← 이전 주
      </button>

      <div class="text-center">
        <p class="text-lg font-bold text-slate-900">${data.week.title}</p>
        <p class="text-xs text-slate-400 mt-0.5">
          ${selectedWeekId === currentWeekId ? '이번 주' : '지난 주'}
          · ${data.week.updatedAt} 업데이트
        </p>
      </div>

      <button
        data-week-nav="next"
        class="rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
          hasNext
            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
        }"
        ${hasNext ? '' : 'disabled'}
      >
        다음 주 →
      </button>
    </div>
  `
}

export function renderMenuCards(data: AppData): string {
  const images = data.week.menuImages ?? {}

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${data.cafeterias
        .map((c) => {
          const imageUrl = images[c.id]
          return `
            <article
              class="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm"
              style="border-left: 4px solid ${c.color}"
            >
              <div class="px-5 py-4 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">${c.name}</h3>
                <p class="text-sm text-slate-500 mt-1">
                  ${c.building} ${c.floor} · 점심 ${formatPrice(c.prices.lunch)}${c.prices.dinner ? ` · 저녁 ${formatPrice(c.prices.dinner)}` : ''}
                </p>
              </div>
              ${
                imageUrl
                  ? `<figure class="p-4 bg-slate-50">
                      <img
                        src="${imageUrl}"
                        alt="${c.name} ${data.week.title} 주간 식단표"
                        class="w-full rounded-lg border border-slate-200"
                        loading="lazy"
                        width="600"
                        height="800"
                      />
                      <figcaption class="sr-only">${c.name} 이번 주 식단표</figcaption>
                    </figure>`
                  : `<div class="p-8 text-center text-slate-400 text-sm">이번 주 식단표 이미지 준비 중</div>`
              }
            </article>
          `
        })
        .join('')}
    </div>
  `
}
