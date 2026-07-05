import { partiboxGuideContent } from '../content/partiboxGuide'
import { siteMeta, subPageNavLinks } from '../content/siteContent'
import { cafeteriaMapUrl } from '../services/menuService'
import { renderFooter } from '../render/layout'

function renderGuideImage(image: string, caption: string, alt: string): string {
  return `
    <figure class="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        class="block w-full text-left"
        data-guide-image-zoom
        data-image-src="${image}"
        data-image-alt="${alt}"
        aria-label="${alt} 크게 보기"
      >
        <img
          src="${image}"
          alt="${alt}"
          class="w-full object-cover cursor-zoom-in hover:opacity-95 transition"
          loading="lazy"
        />
      </button>
      <figcaption class="px-4 py-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
        ${caption}
      </figcaption>
    </figure>
  `
}

function renderGuideLightbox(): string {
  return `
    <div
      id="guide-image-lightbox"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="사진 확대 보기"
    >
      <button
        type="button"
        data-guide-lightbox-close
        class="absolute top-4 right-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
        aria-label="닫기"
      >
        닫기 ✕
      </button>
      <figure class="flex max-h-full max-w-full flex-col items-center">
        <img
          data-guide-lightbox-image
          src=""
          alt=""
          class="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
        <figcaption data-guide-lightbox-caption class="mt-3 text-center text-sm text-white/90"></figcaption>
      </figure>
    </div>
  `
}

export function renderPartiboxGuide(): string {
  const { summary, directions, tickets, interior } = partiboxGuideContent

  return `
    <article class="space-y-12">
      <section class="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <p class="text-slate-600 leading-relaxed mb-4">${partiboxGuideContent.intro}</p>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt class="text-slate-500">주소</dt><dd class="font-medium text-slate-900">${summary.address}</dd></div>
          <div><dt class="text-slate-500">위치</dt><dd class="font-medium text-slate-900">${summary.floor}</dd></div>
          <div><dt class="text-slate-500">영업 시간</dt><dd class="font-medium text-slate-900">${summary.hours}</dd></div>
          <div><dt class="text-slate-500">점심 가격</dt><dd class="font-medium text-slate-900">${summary.lunchPrice}</dd></div>
        </dl>
        <ul class="mt-4 flex flex-wrap gap-2">
          ${summary.notes.map((note) => `<li class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">${note}</li>`).join('')}
        </ul>
        <div class="mt-5 flex flex-wrap gap-3">
          <a
            href="${cafeteriaMapUrl({ mapQuery: '동서대학교 센텀캠퍼스 파티박스' })}"
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
        <p class="text-sm text-slate-500 mb-6">동서대 센텀캠퍼스에서 파티박스까지 걸어서 이동하는 경로입니다.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${directions.steps
            .map((step, i) => renderGuideImage(step.image, step.caption, `파티박스 가는 길 ${i + 1}`))
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${tickets.images
            .map((item, i) => renderGuideImage(item.image, item.caption, `파티박스 식권 안내 ${i + 1}`))
            .join('')}
        </div>
      </section>

      <section aria-labelledby="interior-heading">
        <h2 id="interior-heading" class="text-2xl font-bold text-slate-900 mb-2">${interior.title}</h2>
        <p class="text-sm text-slate-500 mb-6">매장 내부와 뷔페 라인 모습입니다.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${interior.images
            .map((item, i) => renderGuideImage(item.image, item.caption, `파티박스 식당 전경 ${i + 1}`))
            .join('')}
        </div>
      </section>
    </article>
    ${renderGuideLightbox()}
  `
}

export function renderPartiboxHeader(): string {
  return `
    <header class="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav aria-label="주요 메뉴" class="mb-6">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-orange-50">
            ${subPageNavLinks
              .map(
                (link) =>
                  `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`,
              )
              .join('')}
          </ul>
        </nav>

        <p class="text-orange-100 text-sm font-medium mb-2">
          <a href="/" class="hover:underline">${siteMeta.name}</a>
        </p>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${partiboxGuideContent.title}</h1>
        <p class="text-orange-50 mt-2">${partiboxGuideContent.subtitle}</p>
      </div>
    </header>
  `
}

export function bindGuideImageZoom(): void {
  const lightbox = document.getElementById('guide-image-lightbox')
  const lightboxImage = lightbox?.querySelector<HTMLImageElement>('[data-guide-lightbox-image]')
  const lightboxCaption = lightbox?.querySelector<HTMLElement>('[data-guide-lightbox-caption]')

  if (!lightbox || !lightboxImage || !lightboxCaption) return

  const closeLightbox = () => {
    lightbox.classList.add('hidden')
    lightbox.classList.remove('flex')
    document.body.style.overflow = ''
    lightboxImage.removeAttribute('src')
    lightboxImage.alt = ''
    lightboxCaption.textContent = ''
  }

  const openLightbox = (src: string, alt: string) => {
    lightboxImage.src = src
    lightboxImage.alt = alt
    lightboxCaption.textContent = alt
    lightbox.classList.remove('hidden')
    lightbox.classList.add('flex')
    document.body.style.overflow = 'hidden'
  }

  document.querySelectorAll<HTMLButtonElement>('[data-guide-image-zoom]').forEach((button) => {
    button.addEventListener('click', () => {
      const src = button.dataset.imageSrc
      const alt = button.dataset.imageAlt ?? '사진'
      if (src) openLightbox(src, alt)
    })
  })

  lightbox.querySelectorAll<HTMLElement>('[data-guide-lightbox-close]').forEach((el) => {
    el.addEventListener('click', closeLightbox)
  })

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      closeLightbox()
    }
  })
}

export function createPartiboxApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="min-h-screen">
      ${renderPartiboxHeader()}

      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        ${renderPartiboxGuide()}
      </main>

      ${renderFooter(subPageNavLinks)}
    </div>
  `

  bindGuideImageZoom()
}
