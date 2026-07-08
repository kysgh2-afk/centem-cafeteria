import { stxGuideContent } from '../content/stxGuide'
import { siteMeta, subPageNavLinks } from '../content/siteContent'
import { cafeteriaMapUrl } from '../services/menuService'
import { renderFooter } from '../render/layout'
import { bindGuideImageZoom, renderGuideImage, renderGuideLightbox } from '../render/guidePageShared'

export function renderStxGuide(): string {
  const { summary, directions, amenities, interior, tickets } = stxGuideContent

  return `
    <article class="space-y-12">
      <section class="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <p class="text-slate-600 leading-relaxed mb-4">${stxGuideContent.intro}</p>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt class="text-slate-500">주소</dt><dd class="font-medium text-slate-900">${summary.address}</dd></div>
          <div><dt class="text-slate-500">위치</dt><dd class="font-medium text-slate-900">${summary.floor}</dd></div>
          <div><dt class="text-slate-500">영업 시간</dt><dd class="font-medium text-slate-900">${summary.hours}</dd></div>
          <div><dt class="text-slate-500">점심 가격</dt><dd class="font-medium text-slate-900">${summary.lunchPrice}</dd></div>
          <div><dt class="text-slate-500">저녁 가격</dt><dd class="font-medium text-slate-900">${summary.dinnerPrice}</dd></div>
        </dl>
        <ul class="mt-4 flex flex-wrap gap-2">
          ${summary.notes.map((note) => `<li class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">${note}</li>`).join('')}
        </ul>
        <div class="mt-5 flex flex-wrap gap-3">
          <a
            href="${cafeteriaMapUrl({ mapQuery: '영상산업센터', mapUrl: 'https://kko.to/8OSCCGiB3x' })}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            지도 보기 →
          </a>
          <a
            href="/#menus"
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            이번 주 식단표 보기
          </a>
        </div>
      </section>

      <section aria-labelledby="directions-heading">
        <h2 id="directions-heading" class="text-2xl font-bold text-slate-900 mb-2">${directions.title}</h2>
        <p class="text-sm text-slate-500 mb-6">${directions.intro}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${directions.steps
            .map((step, i) => renderGuideImage(step.image, step.caption, `영상산업센터 가는 길 ${i + 1}`))
            .join('')}
        </div>
      </section>

      <section aria-labelledby="tickets-heading">
        <h2 id="tickets-heading" class="text-2xl font-bold text-slate-900 mb-2">${tickets.title}</h2>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">${tickets.intro}</p>
        <div class="rounded-xl bg-slate-50 border border-slate-200 p-5 mb-6">
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            ${tickets.prices
              .map(
                (price) => `
              <li class="flex justify-between gap-4 py-1 border-b border-slate-200/80 last:border-0">
                <span class="text-slate-600">${price.label}</span>
                <span class="font-semibold text-slate-900">${price.amount}</span>
              </li>
            `,
              )
              .join('')}
          </ul>
        </div>
        <ul class="text-sm text-slate-600 space-y-1 mb-6 list-disc pl-5">
          ${tickets.tips.map((tip) => `<li>${tip}</li>`).join('')}
        </ul>
        <div class="grid grid-cols-1 gap-4">
          ${tickets.images
            .map((item, i) => renderGuideImage(item.image, item.caption, `영상산업센터 식권 안내 ${i + 1}`))
            .join('')}
        </div>
      </section>

      <section aria-labelledby="amenities-heading">
        <h2 id="amenities-heading" class="text-2xl font-bold text-slate-900 mb-2">${amenities.title}</h2>
        <div class="grid grid-cols-1 gap-4">
          ${amenities.images
            .map((item, i) => renderGuideImage(item.image, item.caption, `영상산업센터 편의시설 ${i + 1}`))
            .join('')}
        </div>
      </section>

      <section aria-labelledby="interior-heading">
        <h2 id="interior-heading" class="text-2xl font-bold text-slate-900 mb-2">${interior.title}</h2>
        <p class="text-sm text-slate-500 mb-6">매장 내부와 뷔페 라인 모습입니다.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${interior.images
            .map((item, i) => renderGuideImage(item.image, item.caption, `영상산업센터 식당 전경 ${i + 1}`))
            .join('')}
        </div>
      </section>
    </article>
    ${renderGuideLightbox()}
  `
}

export function renderStxHeader(): string {
  return `
    <header class="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav aria-label="주요 메뉴" class="mb-6">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-blue-50">
            ${subPageNavLinks
              .map(
                (link) =>
                  `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`,
              )
              .join('')}
          </ul>
        </nav>

        <p class="text-blue-100 text-sm font-medium mb-2">
          <a href="/" class="hover:underline">${siteMeta.name}</a>
        </p>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${stxGuideContent.title}</h1>
        <p class="text-blue-50 mt-2">${stxGuideContent.subtitle}</p>
      </div>
    </header>
  `
}

export function createStxApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="min-h-screen">
      ${renderStxHeader()}

      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        ${renderStxGuide()}
      </main>

      ${renderFooter(subPageNavLinks)}
    </div>
  `

  bindGuideImageZoom()
}
