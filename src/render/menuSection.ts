import type { AppData } from '../types'
import { formatPrice, cafeteriaMapUrl } from '../services/menuService'
import { getGuidePage } from '../utils/guidePage'

export function renderWeekNav(data: AppData, selectedWeekId: string): string {
  const { weeks, currentWeekId } = data.weekIndex
  const currentIndex = weeks.findIndex((w) => w.id === selectedWeekId)
  const hasPrev = currentIndex < weeks.length - 1
  const hasNext = currentIndex > 0

  return `
    <div class="week-switcher">
      <button
        data-week-nav="prev"
        class="week-switcher__button"
        ${hasPrev ? '' : 'disabled'}
      >
        <span aria-hidden="true">←</span> 이전 주
      </button>

      <div class="week-switcher__date">
        <strong>${data.week.title}</strong>
        <span>
          ${selectedWeekId === currentWeekId ? '이번 주' : '지난 주'}
          · ${data.week.updatedAt} 업데이트
        </span>
      </div>

      <button
        data-week-nav="next"
        class="week-switcher__button"
        ${hasNext ? '' : 'disabled'}
      >
        다음 주 <span aria-hidden="true">→</span>
      </button>
    </div>
  `
}

function renderCardActions(menuLink: string | undefined, mapUrl: string, guidePage?: string): string {
  const menuButton = menuLink
    ? `
      <a
        href="${menuLink}"
        target="_blank"
        rel="noopener noreferrer"
        class="action-button"
      >
        메뉴 확인하기 →
      </a>
    `
    : ''

  const guideButton = guidePage
    ? `
      <a
        href="${guidePage}"
        class="action-button"
      >
        식당 안내 →
      </a>
    `
    : ''

  return `
    <div class="menu-actions">
        ${menuButton}
        <a
          href="${mapUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="action-button"
        >
          지도 보기 →
        </a>
        ${guideButton}
    </div>
  `
}

function renderMenuContent(
  name: string,
  weekTitle: string,
  imageUrl?: string,
  menuBoardHtml?: string,
  sourceUrl?: string,
): string {
  if (imageUrl) {
    const alt = `${name} ${weekTitle} 주간 식단표`
    return `
      <figure class="menu-media p-3 sm:p-4">
        <button
          type="button"
          class="group block w-full text-left"
          data-menu-image-zoom
          data-image-src="${imageUrl}"
          data-image-alt="${alt}"
          aria-label="${name} 식단표 크게 보기"
        >
          <img
            src="${imageUrl}"
            alt="${alt}"
            class="w-full rounded-lg transition group-hover:opacity-95 cursor-zoom-in"
            loading="lazy"
            width="600"
            height="800"
          />
          <span class="mt-2 block text-center text-xs text-slate-400 group-hover:text-slate-600">
            클릭하여 크게 보기
          </span>
        </button>
        <figcaption class="sr-only">${name} 이번 주 식단표</figcaption>
      </figure>
    `
  }

  if (menuBoardHtml) {
    return `
      <div class="menu-media menu-board overflow-x-auto p-3 sm:p-4">
        ${menuBoardHtml}
      </div>
    `
  }

  if (sourceUrl) {
    return `
      <div class="menu-media p-8 text-center">
        <p class="text-sm text-slate-500 mb-4">이번 주 식단표를 불러오지 못했습니다.</p>
        <a
          href="${sourceUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          공식 메뉴 보기 →
        </a>
      </div>
    `
  }

  return `<div class="menu-media p-8 text-center text-slate-400 text-sm">이번 주 식단표 이미지 준비 중</div>`
}

export function renderMenuCards(data: AppData): string {
  const images = data.week.menuImages ?? {}
  const sourceUrls = data.week.menuSourceUrls ?? {}
  const menuBoards = data.week.menuBoardHtml ?? {}

  return `
    <div class="menu-grid">
      ${data.cafeterias
        .map((c) => {
          const imageUrl = images[c.id]
          const sourceUrl = sourceUrls[c.id]
          const menuBoardHtml = menuBoards[c.id]
          const menuLink = c.menuLink ?? sourceUrl

          return `
            <article
              class="menu-card"
              style="--card-accent: ${c.color}"
            >
              <span class="menu-card__accent" aria-hidden="true"></span>
              <div class="menu-card__header">
                <div>
                  <h3 class="menu-card__title">${c.name}</h3>
                  <p class="menu-card__meta">${c.building} ${c.floor}${c.prices.dinner ? ` · 저녁 ${formatPrice(c.prices.dinner)}` : ''}</p>
                </div>
                <span class="menu-card__price">점심 ${formatPrice(c.prices.lunch)}</span>
              </div>
              ${renderMenuContent(c.name, data.week.title, imageUrl, menuBoardHtml, sourceUrl)}
              ${renderCardActions(menuLink, cafeteriaMapUrl(c), getGuidePage(c))}
            </article>
          `
        })
        .join('')}
    </div>
    ${renderMenuImageLightbox()}
  `
}

export function renderMenuImageLightbox(): string {
  return `
    <div
      id="menu-image-lightbox"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="식단표 확대 보기"
    >
      <button
        type="button"
        data-lightbox-close
        class="absolute top-4 right-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
        aria-label="닫기"
      >
        닫기 ✕
      </button>
      <figure class="flex max-h-full max-w-full flex-col items-center">
        <img
          data-lightbox-image
          src=""
          alt=""
          class="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
        <figcaption data-lightbox-caption class="mt-3 text-center text-sm text-white/90"></figcaption>
      </figure>
    </div>
  `
}

export function bindMenuImageZoom(signal?: AbortSignal): void {
  const lightbox = document.getElementById('menu-image-lightbox')
  const lightboxImage = lightbox?.querySelector<HTMLImageElement>('[data-lightbox-image]')
  const lightboxCaption = lightbox?.querySelector<HTMLElement>('[data-lightbox-caption]')

  if (!lightbox || !lightboxImage || !lightboxCaption) return

  const listenerOptions = signal ? { signal } : undefined

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
    lightbox.querySelector<HTMLButtonElement>('[data-lightbox-close]')?.focus()
  }

  document.querySelectorAll<HTMLButtonElement>('[data-menu-image-zoom]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const src = button.dataset.imageSrc
        const alt = button.dataset.imageAlt ?? '식단표'
        if (src) openLightbox(src, alt)
      },
      listenerOptions,
    )
  })

  lightbox.querySelectorAll<HTMLElement>('[data-lightbox-close]').forEach((el) => {
    el.addEventListener('click', closeLightbox, listenerOptions)
  })

  lightbox.addEventListener(
    'click',
    (event) => {
      if (event.target === lightbox) closeLightbox()
    },
    listenerOptions,
  )

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && !lightbox.classList.contains('hidden')) {
        closeLightbox()
      }
    },
    listenerOptions,
  )
}
