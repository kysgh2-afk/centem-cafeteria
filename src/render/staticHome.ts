import type { AppData } from '../types'
import { renderHeader, renderFooter, renderResourceGuidesSection, renderAreaGuideSection, renderDisclaimerSection } from './layout'
import { renderMenuCards, renderWeekNav } from './menuSection'
import { renderRestaurantInfoCards } from './restaurantInfo'

export function renderStaticHome(data: AppData): string {
  return `<div class="min-h-screen" data-prerendered>${renderHeader(data)}
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <section id="menus" class="scroll-mt-8" aria-labelledby="menus-heading">
        <div class="section-heading"><div><p class="eyebrow">WEEKLY MENU</p><h2 id="menus-heading">오늘 점심, 빠르게 골라요</h2><p>식당별 적용 날짜를 확인한 뒤 가격과 위치를 비교하세요.</p></div></div>
        ${renderWeekNav(data, data.weekIndex.currentWeekId)}
        ${renderMenuCards(data, { maxPrice: null, favoritesOnly: false }, new Set())}
      </section>
      <section id="restaurants" class="scroll-mt-8 mt-12" aria-labelledby="restaurants-heading">
        <h2 id="restaurants-heading" class="text-2xl font-bold text-slate-900 mb-2">식당 정보</h2>
        <p class="text-sm text-slate-500 mb-6">위치, 가격, 영업 시간을 비교해 보세요. 당일 변경 사항은 식당 공지와 현장 안내가 우선입니다.</p>
        ${renderRestaurantInfoCards(data.cafeterias)}
      </section>
      ${renderResourceGuidesSection()}${renderAreaGuideSection()}${renderDisclaimerSection()}
    </main>${renderFooter()}</div>`
}
