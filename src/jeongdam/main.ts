import '../style.css'
import { jeongdamGuideContent, jeongdamGuidePagePath } from '../content/jeongdamGuide'
import { setupPageSeo } from '../seo/documentMeta'
import { buildOrganizationJsonLd, buildWebPageJsonLd, buildWebSiteJsonLd, injectJsonLd } from '../seo/jsonLd'
import { createJeongdamApp } from './app'

setupPageSeo(jeongdamGuidePagePath)
injectJsonLd('json-ld-jeongdam', {
  '@context': 'https://schema.org',
  '@graph': [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildWebPageJsonLd(jeongdamGuidePagePath, jeongdamGuideContent.title, jeongdamGuideContent.intro),
  ],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createJeongdamApp(app)
