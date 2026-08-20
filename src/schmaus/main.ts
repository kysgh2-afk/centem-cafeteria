import '../style.css'
import { schmausGuideContent } from '../content/schmausGuide'
import { buildOrganizationJsonLd, buildWebPageJsonLd, buildWebSiteJsonLd, injectJsonLd } from '../seo/jsonLd'
import { setupPageSeo } from '../seo/documentMeta'
import { createSchmausApp } from './app'

setupPageSeo('/schmaus.html')
injectJsonLd('json-ld-schmaus', {
  '@context': 'https://schema.org',
  '@graph': [
    buildWebSiteJsonLd(),
    buildOrganizationJsonLd(),
    buildWebPageJsonLd('/schmaus.html', schmausGuideContent.title, schmausGuideContent.intro),
    {
      '@type': 'Restaurant',
      name: '슈마우스 만찬 센텀점',
      address: {
        '@type': 'PostalAddress',
        streetAddress: schmausGuideContent.summary.address,
        addressLocality: '해운대구',
        addressRegion: '부산광역시',
        addressCountry: 'KR',
      },
      priceRange: '7,500원',
      servesCuisine: '한식 뷔페',
    },
  ],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createSchmausApp(app)
