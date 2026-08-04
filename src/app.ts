import { fetchAppData } from './services/menuService'
import {
  renderAboutSection,
  renderAreaGuideSection,
  renderDisclaimerSection,
  renderFeaturesSection,
  renderFaqSection,
  renderFooter,
  renderGuideSection,
  renderHeader,
  updateJsonLd,
} from './render/layout'
import { bindMenuImageZoom, renderMenuCards, renderWeekNav } from './render/menuSection'
import { renderRestaurantInfoCards } from './render/restaurantInfo'
import type { AppData } from './types'

interface AppState {
  data: AppData | null
  selectedWeekId: string
  loading: boolean
  error: string | null
}

export function createApp(root: HTMLElement) {
  const state: AppState = {
    data: null,
    selectedWeekId: '',
    loading: true,
    error: null,
  }

  let menuZoomAbort: AbortController | null = null

  function render() {
    updateJsonLd(state.data)

    root.innerHTML = `
      <div class="min-h-screen">
        ${renderHeader(state.data)}

        <main class="page-shell max-w-6xl mx-auto px-4 sm:px-6">
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
            <section id="menus" class="content-section" aria-labelledby="menus-heading">
              <div class="section-heading">
                <div class="section-heading__copy">
                  <p class="section-eyebrow">Weekly menu</p>
                  <h2 id="menus-heading" class="section-title">이번 주 식단표</h2>
                  <p class="section-description">센텀시티 구내식당 8곳의 메뉴를 한눈에 비교해 보세요. 식단표를 누르면 더 크게 볼 수 있습니다.</p>
                </div>
              </div>
              ${renderWeekNav(state.data!, state.selectedWeekId)}
              ${renderMenuCards(state.data!)}
            </section>

            <section id="restaurants" class="content-section" aria-labelledby="restaurants-heading">
              <div class="section-heading">
                <div class="section-heading__copy">
                  <p class="section-eyebrow">Restaurant directory</p>
                  <h2 id="restaurants-heading" class="section-title">식당 정보</h2>
                  <p class="section-description">위치, 가격, 영업 시간을 비교해 오늘의 점심 동선을 계획하세요. 영업 상태는 한국 시간 기준입니다.</p>
                </div>
              </div>
              ${renderRestaurantInfoCards(state.data!.cafeterias)}
            </section>

            ${renderFaqSection()}
            ${renderGuideSection()}
            ${renderAreaGuideSection()}
            ${renderAboutSection()}
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
