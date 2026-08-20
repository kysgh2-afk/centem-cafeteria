import { schmausGuideContent } from '../content/schmausGuide'
import { siteMeta, subPageNavLinks } from '../content/siteContent'
import { bindGuideImageZoom, renderGuideImage, renderGuideLightbox } from '../render/guidePageShared'
import { renderFooter } from '../render/layout'

function renderSummary(): string {
  const { summary } = schmausGuideContent

  return `
    <section class="schmaus-summary rounded-3xl bg-white border border-rose-100 p-6 sm:p-8 shadow-sm">
      <p class="text-slate-600 leading-relaxed mb-6">${schmausGuideContent.intro}</p>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><dt class="text-slate-500">주소</dt><dd class="font-semibold text-slate-900">${summary.address}</dd></div>
        <div><dt class="text-slate-500">위치</dt><dd class="font-semibold text-slate-900">${summary.floor}</dd></div>
        <div><dt class="text-slate-500">영업 시간</dt><dd class="font-semibold text-slate-900">${summary.hours}</dd></div>
        <div><dt class="text-slate-500">점심 가격</dt><dd class="font-semibold text-slate-900">${summary.lunchPrice}</dd></div>
      </dl>
      <ul class="mt-6 flex flex-wrap gap-2">
        ${summary.notes.map((note) => `<li class="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">${note}</li>`).join('')}
      </ul>
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <a href="https://map.kakao.com/?q=${encodeURIComponent('슈마우스만찬 센텀점')}" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-800">지도 보기 →</a>
        <a href="/#menus" class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">이번 주 식단표 보기</a>
      </div>
    </section>
  `
}

function renderDirections(): string {
  const { directions } = schmausGuideContent

  return `
    <section aria-labelledby="schmaus-directions-heading">
      <div class="section-heading-simple">
        <p class="schmaus-eyebrow">HOW TO GET THERE</p>
        <h2 id="schmaus-directions-heading">${directions.title}</h2>
        <p>${directions.intro}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${directions.steps.map((step, index) => renderGuideImage(step.image, step.caption, `슈마우스 만찬 가는 길 ${index + 1}`)).join('')}
      </div>
    </section>
  `
}

function renderMenu(): string {
  const { menu } = schmausGuideContent

  return `
    <section aria-labelledby="schmaus-menu-heading">
      <div class="section-heading-simple">
        <p class="schmaus-eyebrow">TODAY'S LINE-UP</p>
        <h2 id="schmaus-menu-heading">${menu.title}</h2>
        <p>${menu.intro}</p>
      </div>
      <div class="max-w-xl mx-auto">
        ${renderGuideImage(menu.image, menu.caption, '슈마우스 만찬 오늘의 메뉴판')}
      </div>
    </section>
  `
}

function renderTickets(): string {
  const { tickets } = schmausGuideContent

  return `
    <section aria-labelledby="schmaus-tickets-heading">
      <div class="section-heading-simple">
        <p class="schmaus-eyebrow">PAYMENT</p>
        <h2 id="schmaus-tickets-heading">${tickets.title}</h2>
        <p>${tickets.intro}</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-5 items-start">
        <div class="rounded-2xl bg-rose-950 p-6 text-white shadow-sm">
          <p class="text-sm font-bold text-rose-200 mb-4">식권 가격</p>
          <ul class="space-y-3">
            ${tickets.prices.map((price) => `<li class="flex items-center justify-between gap-4 border-b border-white/15 pb-3 last:border-0 last:pb-0"><span class="text-sm text-rose-50">${price.label}</span><strong class="text-lg">${price.amount}</strong></li>`).join('')}
          </ul>
          <div class="mt-5 rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-rose-950">10장 구매 시 1장 추가 제공</div>
          <ul class="mt-5 space-y-2 text-xs leading-relaxed text-rose-100">
            ${tickets.tips.map((tip) => `<li>• ${tip}</li>`).join('')}
          </ul>
        </div>
        ${renderGuideImage(tickets.image, tickets.caption, '슈마우스 만찬 식권 결제 안내')}
      </div>
    </section>
  `
}

function renderServices(): string {
  const { services } = schmausGuideContent

  return `
    <section aria-labelledby="schmaus-services-heading">
      <div class="section-heading-simple">
        <p class="schmaus-eyebrow">FREE SELF SERVICE</p>
        <h2 id="schmaus-services-heading">${services.title}</h2>
        <p>${services.intro}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${services.items.map((item, index) => `
          <article>
            ${renderGuideImage(item.image, item.caption, `슈마우스 만찬 ${item.title} ${index + 1}`)}
            <h3 class="mt-3 text-lg font-extrabold text-slate-900">${item.title}</h3>
          </article>
        `).join('')}
      </div>
    </section>
  `
}

function renderInterior(): string {
  const { interior } = schmausGuideContent

  return `
    <section aria-labelledby="schmaus-interior-heading">
      <div class="section-heading-simple">
        <p class="schmaus-eyebrow">INSIDE</p>
        <h2 id="schmaus-interior-heading">${interior.title}</h2>
        <p>${interior.intro}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${interior.images.map((item, index) => renderGuideImage(item.image, item.caption, `슈마우스 만찬 내부 전경 ${index + 1}`)).join('')}
      </div>
    </section>
  `
}

function renderHeader(): string {
  return `
    <header class="schmaus-hero text-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
        <nav aria-label="주요 메뉴" class="mb-10">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-rose-100">
            ${subPageNavLinks.map((link) => `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`).join('')}
          </ul>
        </nav>
        <p class="text-amber-300 text-xs font-black tracking-[0.18em] mb-3">CENTUM SKY BIZ · B1</p>
        <p class="text-rose-100 text-sm font-semibold mb-2"><a href="/" class="hover:underline">${siteMeta.name}</a></p>
        <h1 class="text-4xl sm:text-6xl font-black tracking-[-0.055em] leading-tight">${schmausGuideContent.title}</h1>
        <p class="text-rose-100 mt-3 text-base sm:text-lg">${schmausGuideContent.subtitle}</p>
      </div>
    </header>
  `
}

export function createSchmausApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="min-h-screen">
      ${renderHeader()}
      <main class="schmaus-guide max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-16">
        ${renderSummary()}
        ${renderDirections()}
        ${renderMenu()}
        ${renderTickets()}
        ${renderServices()}
        ${renderInterior()}
      </main>
      ${renderFooter(subPageNavLinks)}
    </div>
    ${renderGuideLightbox()}
  `

  bindGuideImageZoom()
}
