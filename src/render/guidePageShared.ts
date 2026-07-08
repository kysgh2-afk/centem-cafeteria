export function renderGuideImage(image: string, caption: string, alt: string): string {
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

export function renderGuideLightbox(): string {
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
