import '../style.css'
import { partiboxGuideContent } from '../content/partiboxGuide'
import { setupPageSeo } from '../seo/documentMeta'
import { buildOrganizationJsonLd, buildWebPageJsonLd, buildWebSiteJsonLd, injectJsonLd } from '../seo/jsonLd'
import { createPartiboxApp } from './app'

setupPageSeo('/partibox.html')
injectJsonLd('json-ld-partibox', {
  '@context': 'https://schema.org',
  '@graph': [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildWebPageJsonLd(
      '/partibox.html',
      partiboxGuideContent.title,
      partiboxGuideContent.intro,
    ),
  ],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createPartiboxApp(app)
