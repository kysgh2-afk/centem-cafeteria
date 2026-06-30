import '../style.css'
import { aboutContent } from '../content/siteContent'
import { setupPageSeo } from '../seo/documentMeta'
import { buildOrganizationJsonLd, buildWebPageJsonLd, buildWebSiteJsonLd, injectJsonLd } from '../seo/jsonLd'
import { createAboutApp } from './app'

setupPageSeo('/about.html')
injectJsonLd('json-ld-about', {
  '@context': 'https://schema.org',
  '@graph': [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildWebPageJsonLd('/about.html', aboutContent.title, aboutContent.paragraphs[0]),
  ],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createAboutApp(app)
