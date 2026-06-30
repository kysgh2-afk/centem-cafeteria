import { siteMeta } from '../content/siteContent'
import { getSiteOrigin } from './documentMeta'

export function injectJsonLd(id: string, payload: Record<string, unknown>): void {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(payload)
}

export function buildOrganizationJsonLd() {
  const origin = getSiteOrigin()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteMeta.name,
    description: siteMeta.description,
    email: siteMeta.contactEmail,
    ...(origin ? { url: origin } : {}),
  }
}

export function buildWebSiteJsonLd() {
  const origin = getSiteOrigin()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteMeta.name,
    description: siteMeta.description,
    inLanguage: 'ko-KR',
    ...(origin ? { url: origin } : {}),
  }
}

export function buildWebPageJsonLd(path: string, title: string, description: string) {
  const origin = getSiteOrigin()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    inLanguage: 'ko-KR',
    isPartOf: {
      '@type': 'WebSite',
      name: siteMeta.name,
      ...(origin ? { url: origin } : {}),
    },
    ...(origin ? { url: `${origin}${path === '/' ? '/' : path}` } : {}),
  }
}
