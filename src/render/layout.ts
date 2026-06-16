import {
  aboutContent,
  featuresContent,
  mainNavLinks,
  privacyContent,
  siteMeta,
} from '../content/siteContent'
import type { AppData } from '../types'

type NavLink = { label: string; href: string }

export function renderHeader(data: AppData | null, navLinks: readonly NavLink[] = mainNavLinks): string {
  return `
    <header class="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <nav aria-label="주요 메뉴" class="mb-6">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-emerald-50">
            ${navLinks
              .map(
                (link) =>
                  `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`,
              )
              .join('')}
          </ul>
        </nav>

        <p class="text-emerald-100 text-sm font-medium mb-2">부산 해운대 · 센텀시티</p>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-3">${siteMeta.name}</h1>
        <p class="text-emerald-50 text-base max-w-2xl leading-relaxed">${siteMeta.description}</p>
        ${
          data
            ? `
          <div class="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-sm">
            <span class="h-2 w-2 rounded-full bg-green-300" aria-hidden="true"></span>
            ${data.week.title} · ${data.cafeterias.length}개 구내식당
          </div>
        `
            : ''
        }
      </div>
    </header>
  `
}

export function renderAboutSection(): string {
  return `
    <section id="${aboutContent.id}" class="scroll-mt-8" aria-labelledby="about-heading">
      <h2 id="about-heading" class="text-2xl font-bold text-slate-900 mb-4">${aboutContent.title}</h2>
      <div class="prose prose-slate max-w-none space-y-4 text-slate-600 leading-relaxed">
        ${aboutContent.paragraphs.map((p) => `<p>${p}</p>`).join('')}
      </div>
    </section>
  `
}

export function renderFeaturesSection(): string {
  return `
    <section id="${featuresContent.id}" class="scroll-mt-8 mt-12" aria-labelledby="features-heading">
      <h2 id="features-heading" class="text-2xl font-bold text-slate-900 mb-6">${featuresContent.title}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${featuresContent.items
          .map(
            (item) => `
          <article class="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
            <h3 class="font-semibold text-slate-900 mb-2">${item.title}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${item.description}</p>
          </article>
        `,
          )
          .join('')}
      </div>
    </section>
  `
}

export function renderPrivacySection(): string {
  return `
    <article aria-labelledby="privacy-heading">
      <p id="privacy-heading" class="text-sm text-slate-400 mb-8">시행일: ${privacyContent.updatedAt}</p>
      <div class="space-y-8 text-slate-600 leading-relaxed">
        ${privacyContent.sections
          .map(
            (section) => `
          <section>
            <h2 class="text-lg font-semibold text-slate-900 mb-2">${section.title}</h2>
            <p class="text-sm">${section.body}</p>
          </section>
        `,
          )
          .join('')}
      </div>
    </article>
  `
}

export function renderFooter(navLinks: readonly NavLink[] = mainNavLinks): string {
  return `
    <footer class="border-t border-slate-200 bg-white mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p class="font-semibold text-slate-900 mb-2">${siteMeta.name}</p>
        <p class="text-sm text-slate-500 mb-4">${siteMeta.tagline}</p>
        <nav aria-label="하단 메뉴">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
            ${navLinks.map((link) => `<li><a href="${link.href}" class="hover:text-slate-800">${link.label}</a></li>`).join('')}
          </ul>
        </nav>
        <p class="text-xs text-slate-400 mt-6">© ${new Date().getFullYear()} ${siteMeta.name}. All rights reserved.</p>
      </div>
    </footer>
  `
}

export function updateJsonLd(data: AppData | null): void {
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: siteMeta.name,
        description: siteMeta.description,
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'WebPage',
        name: siteMeta.name,
        description: siteMeta.description,
        about: data?.cafeterias.map((c) => ({
          '@type': 'Restaurant',
          name: c.name,
          address: c.address,
          priceRange: `${c.prices.lunch}원`,
        })),
      },
    ],
  }

  let el = document.getElementById('json-ld') as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = 'json-ld'
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(payload)
}
