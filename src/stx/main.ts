import '../style.css'
import { stxGuideContent } from '../content/stxGuide'
import { setupPageSeo } from '../seo/documentMeta'
import { buildOrganizationJsonLd, buildWebPageJsonLd, buildWebSiteJsonLd, injectJsonLd } from '../seo/jsonLd'
import { createStxApp } from './app'

setupPageSeo('/stx.html')
injectJsonLd('json-ld-stx', {
  '@context': 'https://schema.org',
  '@graph': [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildWebPageJsonLd('/stx.html', stxGuideContent.title, stxGuideContent.intro),
  ],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createStxApp(app)
