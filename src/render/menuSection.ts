import type { AppData } from '../types'
import type { VoteData } from '../services/voteService'
import {
  getVoteRanks,
  rankBadgeClass,
  sortCafeteriasByVotes,
} from '../services/voteService'
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

function renderVoteSection(
  cafeteriaId: string,
  count: number,
  rank: number,
  votes: VoteData | null,
  voteSubmitting: boolean,
): string {
  const hasVoted = votes?.hasVoted ?? false
  const votedFor = votes?.votedFor ?? null
  const isThisChoice = votedFor === cafeteriaId
  const disabled = voteSubmitting || hasVoted || !votes

  let buttonLabel = '여기 줄 서기'
  if (voteSubmitting && !hasVoted) {
    buttonLabel = '등록 중...'
  } else if (isThisChoice) {
    buttonLabel = '선택 완료'
  } else if (hasVoted) {
    buttonLabel = '오늘 투표 완료'
  }

  return `
    <div class="px-5 py-4 border-t border-slate-100 bg-white">
      <div class="flex items-center justify-between gap-3 mb-3">
        <div>
          <p class="text-sm font-semibold text-slate-800">오늘 방문 예정 ${count}명</p>
          <p class="text-xs text-slate-400 mt-0.5">IP당 하루 1회 · 한국 시간 기준</p>
        </div>
        <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${rankBadgeClass(rank)}">
          ${rank}위
        </span>
      </div>

      <button
        type="button"
        data-vote="${cafeteriaId}"
        class="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          disabled
            ? isThisChoice
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }"
        ${disabled ? 'disabled' : ''}
      >
        ${buttonLabel}
      </button>

      ${
        isThisChoice
          ? '<p class="text-xs text-emerald-600 mt-2 text-center">오늘 이 식당에 줄 서기로 선택했습니다.</p>'
          : hasVoted && votedFor
            ? '<p class="text-xs text-slate-400 mt-2 text-center">오늘은 다른 식당에 이미 투표했습니다.</p>'
            : ''
      }
    </div>
  `
}

export function renderMenuCards(
  data: AppData,
  votes: VoteData | null,
  voteSubmitting = false,
): string {
  const images = data.week.menuImages ?? {}
  const counts = votes?.counts ?? {
    stx: 0,
    partibox: 0,
    dawa: 0,
    manna: 0,
  }

  const sorted = sortCafeteriasByVotes(data.cafeterias, counts)
  const ranks = getVoteRanks(sorted, counts)

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${sorted
        .map((c) => {
          const imageUrl = images[c.id]
          const count = counts[c.id] ?? 0
          const rank = ranks.get(c.id) ?? 4

          return `
            <article
              class="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm"
              style="border-left: 4px solid ${c.color}"
              data-cafeteria-card="${c.id}"
            >
              <div class="px-5 py-4 border-b border-slate-100">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="text-lg font-bold text-slate-900">${c.name}</h3>
                    <p class="text-sm text-slate-500 mt-1">
                      ${c.building} ${c.floor} · 점심 ${formatPrice(c.prices.lunch)}${c.prices.dinner ? ` · 저녁 ${formatPrice(c.prices.dinner)}` : ''}
                    </p>
                  </div>
                  <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${rankBadgeClass(rank)}">
                    ${rank}위
                  </span>
                </div>
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
              ${renderVoteSection(c.id, count, rank, votes, voteSubmitting)}
            </article>
          `
        })
        .join('')}
    </div>
  `
}
