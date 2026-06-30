import './style.css'
import { setupPageSeo } from './seo/documentMeta'
import { buildOrganizationJsonLd, buildWebSiteJsonLd, injectJsonLd } from './seo/jsonLd'
import { createApp } from './app'

setupPageSeo('/')
injectJsonLd('json-ld-base', {
  '@context': 'https://schema.org',
  '@graph': [buildWebSiteJsonLd(), buildOrganizationJsonLd()],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createApp(app)
