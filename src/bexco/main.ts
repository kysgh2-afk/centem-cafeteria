import '../style.css'
import { setupPageSeo } from '../seo/documentMeta'
import { buildWebPageJsonLd, injectJsonLd } from '../seo/jsonLd'
import { createBexcoApp } from './app'

setupPageSeo('/bexco.html')
injectJsonLd('json-ld-bexco', {
  ...buildWebPageJsonLd('/bexco.html', '벡스코 행사 일정', '벡스코 전시회, 이벤트, 공연 일정을 확인하세요.'),
})

const root = document.querySelector<HTMLDivElement>('#app')!
void createBexcoApp(root)
