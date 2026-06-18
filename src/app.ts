import { fetchAppData } from './services/menuService'
import { fetchVotes, submitVote } from './services/voteService'
import type { VoteData } from './services/voteService'
import {
  renderFeaturesSection,
  renderFaqSection,
  renderFooter,
  renderHeader,
  updateJsonLd,
} from './render/layout'
import { renderMenuCards, renderWeekNav } from './render/menuSection'
import { renderRestaurantInfoCards } from './render/restaurantInfo'
import type { AppData, CafeteriaId } from './types'

interface AppState {
  data: AppData | null
  selectedWeekId: string
  votes: VoteData | null
  voteSubmitting: boolean
  loading: boolean
  error: string | null
}

export function createApp(root: HTMLElement) {
  const state: AppState = {
    data: null,
    selectedWeekId: '',
    votes: null,
    voteSubmitting: false,
    loading: true,
    error: null,
  }

  function render() {
    updateJsonLd(state.data)

    root.innerHTML = `
      <div class="min-h-screen">
        ${renderHeader(state.data)}

        <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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
              <h2 id="menus-heading" class="text-2xl font-bold text-slate-900 mb-2">이번 주 식단표</h2>
              <p class="text-sm text-slate-500 mb-6">센텀시티 구내식당 4곳의 주간 식단표입니다. 오늘 방문 예정 인원 순으로 정렬됩니다.</p>
              ${renderWeekNav(state.data!, state.selectedWeekId)}
              ${renderMenuCards(state.data!, state.votes, state.voteSubmitting)}
            </section>

            <section id="restaurants" class="scroll-mt-8 mt-12" aria-labelledby="restaurants-heading">
              <h2 id="restaurants-heading" class="text-2xl font-bold text-slate-900 mb-2">식당 정보</h2>
              <p class="text-sm text-slate-500 mb-6">위치, 가격, 영업 시간을 비교해 보세요. 영업 상태는 한국 시간 기준이며 현장과 다를 수 있습니다.</p>
              ${renderRestaurantInfoCards(state.data!.cafeterias)}
            </section>

            ${renderFaqSection()}
            ${renderFeaturesSection()}
          `
          }
        </main>

        ${renderFooter()}
      </div>
    `

    if (!state.loading && !state.error) bindEvents()
  }

  function bindEvents() {
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
      })
    })

    document.querySelectorAll<HTMLButtonElement>('[data-vote]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!state.data || btn.disabled || state.voteSubmitting || state.votes?.hasVoted) return

        const cafeteriaId = btn.dataset.vote as CafeteriaId
        state.voteSubmitting = true
        render()

        try {
          state.votes = await submitVote(cafeteriaId)
        } catch {
          alert('투표에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        } finally {
          state.voteSubmitting = false
          render()
        }
      })
    })
  }

  async function init() {
    render()

    try {
      const [data, votes] = await Promise.all([fetchAppData(), fetchVotes().catch(() => null)])
      state.data = data
      state.selectedWeekId = data.weekIndex.currentWeekId
      state.votes = votes
    } catch {
      state.error = '식단표를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    } finally {
      state.loading = false
      render()
    }
  }

  init()
}
