import { fetchAppData } from './services/menuService'
import {
  renderAreaGuideSection,
  renderDisclaimerSection,
  renderFeaturesSection,
  renderFooter,
  renderGuideSection,
  renderHeader,
  updateJsonLd,
} from './render/layout'
import { bindMenuImageZoom, renderMenuCards, renderWeekNav, type MenuFilters } from './render/menuSection'
import { renderRestaurantInfoCards } from './render/restaurantInfo'
import type { AppData } from './types'

interface AppState {
  data: AppData | null
  selectedWeekId: string
  loading: boolean
  error: string | null
  filters: MenuFilters
  favorites: Set<string>
  recommendation: string | null
}

export function createApp(root: HTMLElement) {
  const state: AppState = {
    data: null,
    selectedWeekId: '',
    loading: true,
    error: null,
    filters: { maxPrice: null, favoritesOnly: false },
    favorites: new Set(JSON.parse(localStorage.getItem('centum-favorites') ?? '[]') as string[]),
    recommendation: null,
  }

  let menuZoomAbort: AbortController | null = null

  function render() {
    updateJsonLd(state.data)

    root.innerHTML = `
      <div class="min-h-screen">
        ${renderHeader(state.data)}

        <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          ${
            state.loading
              ? `
            <div class="flex flex-col items-center justify-center py-24 text-slate-500" role="status">
              <div class="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mb-4"></div>
              <p>식단표를 불러오는 중...</p>
            </div>
          `
              : state.error
                ? `<div class="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700" role="alert">${state.error}</div>`
                : `
            <section id="menus" class="scroll-mt-8" aria-labelledby="menus-heading">
              <div class="section-heading">
                <div><p class="eyebrow">WEEKLY MENU</p><h2 id="menus-heading">오늘 점심, 빠르게 골라요</h2><p>가격을 비교하고 마음에 드는 식당을 저장해 보세요.</p></div>
                <button type="button" data-random-pick class="primary-action">점심 추천받기</button>
              </div>
              ${state.recommendation ? `<div class="recommendation" role="status"><span>오늘의 추천</span><strong>${state.recommendation}</strong><button type="button" data-clear-recommendation aria-label="추천 닫기">×</button></div>` : ''}
              <div class="menu-toolbar" aria-label="식당 필터">
                <div class="filter-pills">
                  <button type="button" data-price-filter="all" class="${state.filters.maxPrice === null ? 'is-active' : ''}">전체</button>
                  <button type="button" data-price-filter="7000" class="${state.filters.maxPrice === 7000 ? 'is-active' : ''}">7천원 이하</button>
                  <button type="button" data-favorites-only class="${state.filters.favoritesOnly ? 'is-active' : ''}">♥ 즐겨찾기</button>
                </div>
              </div>
              ${renderWeekNav(state.data!, state.selectedWeekId)}
              ${renderMenuCards(state.data!, state.filters, state.favorites)}
            </section>

            <section id="restaurants" class="scroll-mt-8 mt-12" aria-labelledby="restaurants-heading">
              <h2 id="restaurants-heading" class="text-2xl font-bold text-slate-900 mb-2">식당 정보</h2>
              <p class="text-sm text-slate-500 mb-6">위치, 가격, 영업 시간을 비교해 보세요. 영업 상태는 한국 시간 기준이며 현장과 다를 수 있습니다.</p>
              ${renderRestaurantInfoCards(state.data!.cafeterias)}
            </section>

            ${renderGuideSection()}
            ${renderAreaGuideSection()}
            ${renderFeaturesSection()}
            ${renderDisclaimerSection()}
          `
          }
        </main>

        ${renderFooter()}
      </div>
    `

    if (!state.loading && !state.error) bindEvents()
  }

  function bindEvents() {
    menuZoomAbort?.abort()
    const zoomAbort = new AbortController()
    menuZoomAbort = zoomAbort

    document.querySelectorAll<HTMLButtonElement>('[data-week-nav]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!state.data || btn.disabled) return

        const { weeks } = state.data.weekIndex
        const currentIndex = weeks.findIndex((w) => w.id === state.selectedWeekId)
        const direction = btn.dataset.weekNav
        const newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1

        if (newIndex < 0 || newIndex >= weeks.length) return

        state.loading = true
        render()

        try {
          const weekId = weeks[newIndex].id
          state.data = await fetchAppData(weekId)
          state.selectedWeekId = weekId
        } catch {
          state.error = '해당 주간 식단표를 불러오지 못했습니다.'
        } finally {
          state.loading = false
          render()
        }
      }, { signal: zoomAbort.signal })
    })

    document.querySelectorAll<HTMLButtonElement>('[data-price-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filters.maxPrice = button.dataset.priceFilter === 'all' ? null : Number(button.dataset.priceFilter)
        render()
      }, { signal: zoomAbort.signal })
    })

    document.querySelector<HTMLButtonElement>('[data-favorites-only]')?.addEventListener('click', () => {
      state.filters.favoritesOnly = !state.filters.favoritesOnly
      render()
    }, { signal: zoomAbort.signal })

    document.querySelectorAll<HTMLButtonElement>('[data-favorite-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.favoriteId
        if (!id) return
        state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id)
        localStorage.setItem('centum-favorites', JSON.stringify([...state.favorites]))
        render()
      }, { signal: zoomAbort.signal })
    })

    document.querySelector<HTMLButtonElement>('[data-random-pick]')?.addEventListener('click', () => {
      if (!state.data) return
      const candidates = state.data.cafeterias.filter((c) => state.filters.maxPrice === null || c.prices.lunch <= state.filters.maxPrice)
      state.recommendation = candidates[Math.floor(Math.random() * candidates.length)]?.name ?? null
      render()
    }, { signal: zoomAbort.signal })

    document.querySelector<HTMLButtonElement>('[data-clear-recommendation]')?.addEventListener('click', () => {
      state.recommendation = null
      render()
    }, { signal: zoomAbort.signal })

    bindMenuImageZoom(zoomAbort.signal)
  }

  async function init() {
    render()

    try {
      const data = await fetchAppData()
      state.data = data
      state.selectedWeekId = data.weekIndex.currentWeekId
    } catch {
      state.error = '식단표를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    } finally {
      state.loading = false
      render()
    }
  }

  init()
}

