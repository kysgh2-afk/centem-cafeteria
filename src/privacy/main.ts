import '../style.css'
import { privacyContent } from '../content/siteContent'
import { setupPageSeo } from '../seo/documentMeta'
import { buildOrganizationJsonLd, buildWebPageJsonLd, buildWebSiteJsonLd, injectJsonLd } from '../seo/jsonLd'
import { createPrivacyApp } from './app'

setupPageSeo('/privacy.html')
injectJsonLd('json-ld-privacy', {
  '@context': 'https://schema.org',
  '@graph': [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildWebPageJsonLd(
      '/privacy.html',
      privacyContent.title,
      '센텀 구내식당 식단표 모음 사이트의 개인정보처리방침입니다.',
    ),
  ],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createPrivacyApp(app)
