import '../style.css'
import { createCommunityApp } from './app'
import { setupPageSeo } from '../seo/documentMeta'
import { buildOrganizationJsonLd, buildWebPageJsonLd, buildWebSiteJsonLd, injectJsonLd } from '../seo/jsonLd'

const path = '/community.html'
const title = '센텀 커뮤니티'
const description = '센텀시티 직장인이 점심, 교통·주차, 행사·생활 소식과 분실물 정보를 나누는 지역 커뮤니티입니다.'

setupPageSeo(path)
injectJsonLd('json-ld-community', {
  '@context': 'https://schema.org',
  '@graph': [buildWebSiteJsonLd(), buildOrganizationJsonLd(), buildWebPageJsonLd(path, title, description)],
})

const app = document.querySelector<HTMLDivElement>('#app')!
createCommunityApp(app)
