import type { AppData } from '../types'
import { formatPrice, cafeteriaMapUrl } from '../services/menuService'

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

function renderCardActions(menuLink: string | undefined, mapUrl: string): string {
  const menuButton = menuLink
    ? `
      <a
        href="${menuLink}"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        메뉴 확인하기 →
      </a>
    `
    : ''

  return `
    <div class="px-4 pb-4 pt-3 bg-slate-50 border-t border-slate-100">
      <div class="flex flex-col gap-2">
        ${menuButton}
        <a
          href="${mapUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          지도 보기 →
        </a>
      </div>
    </div>
  `
}

function renderMenuContent(
  name: string,
  weekTitle: string,
  imageUrl?: string,
  menuBoardHtml?: string,
  sourceUrl?: string,
): string {
  if (imageUrl) {
    return `
      <figure class="p-4 bg-slate-50">
        <img
          src="${imageUrl}"
          alt="${name} ${weekTitle} 주간 식단표"
          class="w-full rounded-lg border border-slate-200"
          loading="lazy"
          width="600"
          height="800"
        />
        <figcaption class="sr-only">${name} 이번 주 식단표</figcaption>
      </figure>
    `
  }

  if (menuBoardHtml) {
    return `
      <div class="menu-board overflow-x-auto p-4 bg-slate-50">
        ${menuBoardHtml}
      </div>
    `
  }

  if (sourceUrl) {
    return `
      <div class="p-8 text-center bg-slate-50">
        <p class="text-sm text-slate-500 mb-4">이번 주 식단표를 불러오지 못했습니다.</p>
        <a
          href="${sourceUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          공식 메뉴 보기 →
        </a>
      </div>
    `
  }

  return `<div class="p-8 text-center text-slate-400 text-sm">이번 주 식단표 이미지 준비 중</div>`
}

export function renderMenuCards(data: AppData): string {
  const images = data.week.menuImages ?? {}
  const sourceUrls = data.week.menuSourceUrls ?? {}
  const menuBoards = data.week.menuBoardHtml ?? {}

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      ${data.cafeterias
        .map((c) => {
          const imageUrl = images[c.id]
          const sourceUrl = sourceUrls[c.id]
          const menuBoardHtml = menuBoards[c.id]
          const menuLink = c.menuLink ?? sourceUrl

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
              ${renderMenuContent(c.name, data.week.title, imageUrl, menuBoardHtml, sourceUrl)}
              ${renderCardActions(menuLink, cafeteriaMapUrl(c))}
            </article>
          `
        })
        .join('')}
    </div>
  `
}
