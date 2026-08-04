import {
  aboutContent,
  areaGuideContent,
  disclaimerContent,
  faqContent,
  featuresContent,
  footerNavLinks,
  guideContent,
  mainNavLinks,
  privacyContent,
  siteMeta,
} from '../content/siteContent'
import type { AppData } from '../types'
import { getSiteOrigin } from '../seo/documentMeta'
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '../seo/jsonLd'

type NavLink = { label: string; href: string }

export function renderHeader(data: AppData | null, navLinks: readonly NavLink[] = mainNavLinks): string {
  return `
    <header class="site-header">
      <div class="site-header__glow" aria-hidden="true"></div>
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <nav aria-label="주요 메뉴" class="site-nav">
          <a href="/" class="site-brand" aria-label="센텀 구내식당 홈">
            <span class="site-brand__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 10h16a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7Z" />
                <path d="M8 6c0-1 1-1.5 1-2.5M12 6c0-1 1-1.5 1-2.5M16 6c0-1 1-1.5 1-2.5M7 20h10" />
              </svg>
            </span>
            <span>센텀 런치 가이드</span>
          </a>
          <ul class="site-nav__links">
            ${navLinks
              .map((link) => `<li><a href="${link.href}" class="site-nav__link">${link.label}</a></li>`)
              .join('')}
          </ul>
        </nav>

        <div class="hero-wrap">
          <div>
            <p class="hero-eyebrow">Busan · Centum City</p>
            <h1 class="hero-title">오늘의 점심을<br />더 잘 고르는 방법</h1>
            <p class="hero-copy">센텀시티 곳곳의 구내식당 메뉴와 가격, 위치를 한눈에 비교하세요. 매일의 점심 선택이 더 빠르고 즐거워집니다.</p>
            ${
              data
                ? `
              <div class="hero-meta">
                <span class="hero-chip"><span class="hero-chip__dot" aria-hidden="true"></span>${data.week.title} 식단 업데이트</span>
                <span class="hero-chip">점심 ${Math.min(...data.cafeterias.map((c) => c.prices.lunch)).toLocaleString('ko-KR')}원부터</span>
              </div>
            `
                : ''
            }
          </div>
          ${
            data
              ? `
            <div class="hero-number" aria-label="등록된 구내식당 수">
              <strong>${data.cafeterias.length}</strong>
              <span>센텀시티<br />구내식당 모음</span>
            </div>
          `
              : ''
          }
        </div>
      </div>
    </header>
  `
}

export function renderAboutSection(): string {
  return `
    <section id="${aboutContent.id}" class="content-section" aria-labelledby="about-heading">
      <div class="section-heading">
        <div class="section-heading__copy">
          <p class="section-eyebrow">About</p>
          <h2 id="about-heading" class="section-title">${aboutContent.title}</h2>
        </div>
      </div>
      <div class="editorial-panel space-y-4 text-slate-600 leading-relaxed text-sm">
        ${aboutContent.paragraphs.map((p) => `<p>${p}</p>`).join('')}
      </div>
    </section>
  `
}

export function renderGuideSection(): string {
  return `
    <section id="${guideContent.id}" class="content-section" aria-labelledby="guide-heading">
      <div class="section-heading">
        <div class="section-heading__copy">
          <p class="section-eyebrow">Lunch tips</p>
          <h2 id="guide-heading" class="section-title">${guideContent.title}</h2>
          <p class="section-description">${guideContent.intro}</p>
        </div>
      </div>
      <div class="content-grid">
        ${guideContent.sections
          .map(
            (section) => `
          <article class="content-card">
            <h3 class="font-semibold text-slate-900 mb-2">${section.title}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${section.body}</p>
          </article>
        `,
          )
          .join('')}
      </div>
    </section>
  `
}

export function renderAreaGuideSection(): string {
  return `
    <section id="${areaGuideContent.id}" class="content-section" aria-labelledby="areas-heading">
      <div class="section-heading">
        <div class="section-heading__copy">
          <p class="section-eyebrow">Area guide</p>
          <h2 id="areas-heading" class="section-title">${areaGuideContent.title}</h2>
          <p class="section-description">센텀시티 주요 건물별 구내식당 위치와 특징을 정리했습니다.</p>
        </div>
      </div>
      <div class="content-grid">
        ${areaGuideContent.areas
          .map(
            (area) => `
          <article class="content-card">
            <h3 class="font-semibold text-slate-900 mb-1">${area.name}</h3>
            <p class="text-sm font-medium text-emerald-700 mb-2">${area.restaurants}</p>
            <p class="text-sm text-slate-600 leading-relaxed">${area.note}</p>
          </article>
        `,
          )
          .join('')}
      </div>
    </section>
  `
}

export function renderDisclaimerSection(): string {
  return `
    <section id="${disclaimerContent.id}" class="content-section" aria-labelledby="disclaimer-heading">
      <div class="section-heading">
        <div class="section-heading__copy">
          <p class="section-eyebrow">Information</p>
          <h2 id="disclaimer-heading" class="section-title">${disclaimerContent.title}</h2>
        </div>
      </div>
      <div class="content-card space-y-3 text-sm text-slate-600 leading-relaxed">
        ${disclaimerContent.paragraphs.map((p) => `<p>${p}</p>`).join('')}
        <p class="pt-2 border-t border-slate-200">
          <span class="font-medium text-slate-800">${disclaimerContent.contactLabel}:</span>
          <a href="mailto:${siteMeta.contactEmail}" class="text-emerald-700 hover:underline ml-1">${siteMeta.contactEmail}</a>
        </p>
      </div>
    </section>
  `
}

export function renderAboutSectionArticle(): string {
  return `
    <article aria-labelledby="about-heading">
      <div class="prose prose-slate max-w-none space-y-4 text-slate-600 leading-relaxed">
        ${aboutContent.paragraphs.map((p) => `<p>${p}</p>`).join('')}
      </div>
    </article>
  `
}

export function renderFaqSection(): string {
  return `
    <section id="${faqContent.id}" class="content-section" aria-labelledby="faq-heading">
      <div class="section-heading">
        <div class="section-heading__copy">
          <p class="section-eyebrow">FAQ</p>
          <h2 id="faq-heading" class="section-title">${faqContent.title}</h2>
          <p class="section-description">센텀시티 구내식당 이용 전 자주 묻는 질문입니다.</p>
        </div>
      </div>
      <div class="space-y-3">
        ${faqContent.items
          .map(
            (item) => `
          <details class="group faq-card">
            <summary class="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900 flex items-center justify-between gap-3">
              <span>${item.question}</span>
              <span class="text-slate-400 group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
            </summary>
            <div class="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              ${item.answer}
            </div>
          </details>
        `,
          )
          .join('')}
      </div>
    </section>
  `
}

export function renderFeaturesSection(): string {
  return `
    <section id="${featuresContent.id}" class="content-section" aria-labelledby="features-heading">
      <div class="section-heading">
        <div class="section-heading__copy">
          <p class="section-eyebrow">Service</p>
          <h2 id="features-heading" class="section-title">${featuresContent.title}</h2>
        </div>
      </div>
      <div class="content-grid">
        ${featuresContent.items
          .map(
            (item) => `
          <article class="content-card">
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

export function renderFooter(navLinks: readonly NavLink[] = footerNavLinks): string {
  return `
    <footer class="site-footer">
      <div class="site-footer__inner max-w-6xl mx-auto px-4 sm:px-6">
        <div>
          <p class="text-lg font-bold text-white mb-2">센텀 런치 가이드</p>
          <p class="text-sm max-w-xl leading-relaxed">${siteMeta.tagline}</p>
          <p class="text-xs mt-6">© ${new Date().getFullYear()} ${siteMeta.name}. All rights reserved.</p>
        </div>
        <div>
          <nav aria-label="하단 메뉴">
            <ul class="flex flex-wrap gap-x-5 gap-y-3 text-sm">
              ${navLinks.map((link) => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}
            </ul>
          </nav>
          <p class="text-sm mt-5">
            문의 <a href="mailto:${siteMeta.contactEmail}" class="text-white ml-1">${siteMeta.contactEmail}</a>
          </p>
        </div>
      </div>
    </footer>
  `
}

export function updateJsonLd(data: AppData | null): void {
  const origin = getSiteOrigin()
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      buildWebSiteJsonLd(),
      buildOrganizationJsonLd(),
      {
        '@type': 'WebPage',
        name: siteMeta.name,
        description: siteMeta.description,
        inLanguage: 'ko-KR',
        ...(origin ? { url: origin } : {}),
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
