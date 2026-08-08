import { renderFooter } from '../render/layout'
import { siteMeta, subPageNavLinks } from '../content/siteContent'

type EventType = '전시회' | '이벤트·공연'

interface BexcoEvent {
  id: string
  type: EventType
  title: string
  startDate: string
  endDate: string
  place: string
  detailUrl: string
  imageUrl: string | null
}

interface BexcoEventData {
  updatedAt: string
  sourceUrl: string
  events: BexcoEvent[]
}

function formatDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${Number(month)}월 ${Number(day)}일`
}

function dateRange(event: BexcoEvent): string {
  return event.startDate === event.endDate
    ? formatDate(event.startDate)
    : `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`
}

function eventStatus(event: BexcoEvent): string {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
  if (today >= event.startDate && today <= event.endDate) return '진행 중'
  if (today < event.startDate) return '예정'
  return '종료'
}

function renderHeader(): string {
  return `
    <header class="site-hero text-white">
      <div class="hero-orb hero-orb-one" aria-hidden="true"></div>
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative">
        <nav aria-label="주요 메뉴" class="hero-nav mb-10">
          <a href="/" class="brand-mark">센텀런치</a>
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-emerald-50">
            ${subPageNavLinks.map((link) => `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`).join('')}
          </ul>
        </nav>
        <p class="hero-kicker">BEXCO · CENTUM CITY</p>
        <h1 class="mt-3 text-4xl sm:text-6xl font-black tracking-tight">벡스코 행사 일정</h1>
        <p class="hero-copy mt-4">회의를 제외한 전시회·이벤트·공연 일정을 모아 보여드립니다.</p>
      </div>
    </header>
  `
}

function renderEventCard(event: BexcoEvent): string {
  const status = eventStatus(event)
  return `
    <article class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <a href="${event.detailUrl}" target="_blank" rel="noopener noreferrer" class="group block h-full">
        <div class="aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-50 to-orange-50">
          ${event.imageUrl
            ? `<img src="${event.imageUrl}" alt="${event.title} 포스터" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />`
            : `<div class="flex h-full items-center justify-center p-8 text-center"><span class="text-lg font-black text-emerald-800">BEXCO<br/>${event.type}</span></div>`}
        </div>
        <div class="p-5">
          <div class="mb-3 flex items-center gap-2">
            <span class="rounded-full px-2.5 py-1 text-xs font-bold ${event.type === '전시회' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}">${event.type}</span>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">${status}</span>
          </div>
          <h2 class="text-lg font-black leading-snug text-slate-900 group-hover:text-emerald-700">${event.title}</h2>
          <p class="mt-3 text-sm font-semibold text-emerald-700">${dateRange(event)}</p>
          <p class="mt-1 text-sm text-slate-500">${event.place || '벡스코'}</p>
        </div>
      </a>
    </article>
  `
}

export async function createBexcoApp(root: HTMLElement): Promise<void> {
  root.innerHTML = `<div class="min-h-screen">${renderHeader()}<main class="max-w-6xl mx-auto px-4 sm:px-6 py-10"><p class="text-slate-500">행사 일정을 불러오는 중...</p></main>${renderFooter(subPageNavLinks)}</div>`

  try {
    const response = await fetch('/data/bexco-events.json')
    if (!response.ok) throw new Error(String(response.status))
    const data = await response.json() as BexcoEventData
    let selected: '전체' | EventType = '전체'

    const renderContent = () => {
      const events = selected === '전체' ? data.events : data.events.filter((event) => event.type === selected)
      const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
      const monthLabel = `${Number(today.slice(5, 7))}월`
      const currentEvents = events.filter((event) => event.startDate <= today && event.endDate >= today)
      const upcomingEvents = events.filter((event) => event.startDate > today && event.startDate.slice(0, 7) === today.slice(0, 7))
      const main = root.querySelector('main')!
      main.innerHTML = `
        <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="eyebrow">EXHIBITIONS & EVENTS</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight text-slate-900">현재·예정 행사</h2>
            <p class="mt-2 text-sm text-slate-500">${new Date(data.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' })} 기준 · 회의 제외</p>
          </div>
          <a href="${data.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-sm font-bold text-emerald-700 hover:underline">벡스코 공식 일정 보기 →</a>
        </div>
        <div class="mb-7 flex gap-2 overflow-x-auto" aria-label="행사 유형 필터">
          ${(['전체', '전시회', '이벤트·공연'] as const).map((type) => `<button type="button" data-event-filter="${type}" class="min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-bold ${selected === type ? 'bg-emerald-800 text-white' : 'border border-slate-200 bg-white text-slate-600'}">${type}</button>`).join('')}
        </div>
        <section aria-labelledby="current-events-heading">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <p class="eyebrow">HAPPENING NOW</p>
              <h2 id="current-events-heading" class="mt-2 text-2xl font-black tracking-tight text-slate-900">현재 진행 중인 행사</h2>
            </div>
            <span class="text-sm font-bold text-emerald-700">${currentEvents.length}건</span>
          </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">${currentEvents.map(renderEventCard).join('')}</div>
          ${currentEvents.length ? '' : '<p class="rounded-2xl bg-white p-8 text-center text-slate-500">현재 진행 중인 행사가 없습니다.</p>'}
        </section>
        <section class="mt-14 border-t border-slate-200 pt-10" aria-labelledby="upcoming-events-heading">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <p class="eyebrow">COMING THIS MONTH</p>
              <h2 id="upcoming-events-heading" class="mt-2 text-2xl font-black tracking-tight text-slate-900">${monthLabel} 진행 예정 행사</h2>
              <p class="mt-2 text-sm text-slate-500">이번 달 안에 시작하는 전시회·이벤트·공연만 모았습니다.</p>
            </div>
            <span class="text-sm font-bold text-orange-700">${upcomingEvents.length}건</span>
          </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">${upcomingEvents.map(renderEventCard).join('')}</div>
          ${upcomingEvents.length ? '' : '<p class="rounded-2xl bg-white p-8 text-center text-slate-500">이번 달 예정된 행사가 없습니다.</p>'}
        </section>
      `
      main.querySelectorAll<HTMLButtonElement>('[data-event-filter]').forEach((button) => button.addEventListener('click', () => {
        selected = button.dataset.eventFilter as typeof selected
        renderContent()
      }))
    }

    renderContent()
  } catch {
    root.querySelector('main')!.innerHTML = '<div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">행사 일정을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</div>'
  }
}

export { siteMeta }
