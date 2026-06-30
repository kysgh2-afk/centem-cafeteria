import { SITE_URL } from '../generated/siteUrl'

export function getSiteOrigin(): string {
  if (SITE_URL) return SITE_URL
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function setupPageSeo(path: string): void {
  const origin = getSiteOrigin()
  if (!origin) return

  const canonical = `${origin}${path === '/' ? '/' : path}`

  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonicalLink) {
    canonicalLink = document.createElement('link')
    canonicalLink.rel = 'canonical'
    document.head.appendChild(canonicalLink)
  }
  canonicalLink.href = canonical

  let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
  if (!ogUrl) {
    ogUrl = document.createElement('meta')
    ogUrl.setAttribute('property', 'og:url')
    document.head.appendChild(ogUrl)
  }
  ogUrl.content = canonical
}
