import { jeongdamGuideContent } from '../content/jeongdamGuide'
import { subPageNavLinks } from '../content/siteContent'
import { renderFooter } from '../render/layout'
import { bindGuideImageZoom, renderGuideImage, renderGuideLightbox } from '../render/guidePageShared'
import { mapSearchUrl } from '../services/menuService'

function renderSummary(): string {
  const { summary } = jeongdamGuideContent

  return `
    <section class="jeongdam-summary" aria-labelledby="jeongdam-summary-heading">
      <div>
        <p class="jeongdam-eyebrow">JEONGDAM · CENTUM</p>
        <h2 id="jeongdam-summary-heading">정성 담긴 한 끼를 찾는다면</h2>
        <p class="jeongdam-summary-copy">${jeongdamGuideContent.intro}</p>
      </div>
      <dl class="jeongdam-facts">
        <div><dt>주소</dt><dd>${summary.address}</dd></div>
        <div><dt>위치</dt><dd>${summary.floor}</dd></div>
        <div><dt>영업 시간</dt><dd>${summary.hours}</dd></div>
        <div><dt>점심 가격</dt><dd>${summary.lunchPrice}</dd></div>
      </dl>
      <ul class="jeongdam-tags" aria-label="정담식당 특징">
        ${summary.notes.map((note) => `<li>${note}</li>`).join('')}
      </ul>
      <div class="jeongdam-actions">
        <a href="${mapSearchUrl('정담식당 센텀스카이비즈')}" target="_blank" rel="noopener noreferrer">카카오맵에서 위치 보기 →</a>
        <a href="${jeongdamGuideContent.menuUrl}" target="_blank" rel="noopener noreferrer">공식 채널 메뉴 보기 →</a>
      </div>
    </section>
  `
}

function renderDirections(): string {
  const { directions } = jeongdamGuideContent

  return `
    <section class="jeongdam-section" aria-labelledby="directions-heading">
      <p class="jeongdam-eyebrow">WAY TO JEONGDAM</p>
      <h2 id="directions-heading">${directions.title}</h2>
      <p class="jeongdam-section-copy">${directions.intro}</p>
      <div class="jeongdam-route" role="list">
        ${directions.steps
          .map(
            (step, index) => `
              <div class="jeongdam-route-step" role="listitem">
                <span class="jeongdam-step-number" aria-hidden="true">${index + 1}</span>
                ${renderGuideImage(step.image, step.caption, `정담식당 가는 길 ${index + 1}`)}
              </div>
            `,
          )
          .join('')}
      </div>
    </section>
  `
}

function renderDining(): string {
  const { dining, tips } = jeongdamGuideContent

  return `
    <section class="jeongdam-section" aria-labelledby="dining-heading">
      <p class="jeongdam-eyebrow">INSIDE &amp; TIPS</p>
      <h2 id="dining-heading">${dining.title}</h2>
      <p class="jeongdam-section-copy">${dining.intro}</p>
      <div class="jeongdam-interior">
        ${dining.images
          .map((item, index) => renderGuideImage(item.image, item.caption, `정담식당 내부 전경 ${index + 1}`))
          .join('')}
      </div>
      <aside class="jeongdam-tips" aria-labelledby="tips-heading">
        <h3 id="tips-heading">${tips.title}</h3>
        <ul>${tips.items.map((item) => `<li>${item}</li>`).join('')}</ul>
      </aside>
    </section>
  `
}

export function renderJeongdamHeader(): string {
  return `
    <header class="jeongdam-hero text-white">
      <div class="jeongdam-hero-pattern" aria-hidden="true"></div>
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-12 relative">
        <nav aria-label="주요 메뉴" class="hero-nav mb-12">
          <a href="/" class="brand-mark">센텀런치</a>
          <ul class="flex flex-wrap justify-end gap-x-4 gap-y-2 text-sm text-blue-50">
            ${subPageNavLinks
              .map(
                (link) =>
                  `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`,
              )
              .join('')}
          </ul>
        </nav>
        <div class="max-w-3xl py-4 sm:py-9">
          <p class="jeongdam-hero-kicker">센텀스카이비즈 B1 · 가정식 셀프 백반</p>
          <h1>${jeongdamGuideContent.title}</h1>
          <p>${jeongdamGuideContent.subtitle}</p>
        </div>
      </div>
    </header>
  `
}

export function createJeongdamApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="min-h-screen jeongdam-guide">
      ${renderJeongdamHeader()}
      <main class="max-w-5xl mx-auto px-4 sm:px-6 py-9 sm:py-14 space-y-14 sm:space-y-20">
        ${renderSummary()}
        ${renderDirections()}
        ${renderDining()}
        <section class="jeongdam-back-home" aria-label="정담식당 식단표로 이동">
          <p>오늘의 정담식당 메뉴가 궁금한가요?</p>
          <a href="/#menus">이번 주 식단표 확인하기 →</a>
        </section>
      </main>
      ${renderFooter(subPageNavLinks)}
      ${renderGuideLightbox()}
    </div>
  `

  bindGuideImageZoom()
}
