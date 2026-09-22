import '../style.css'
import { setupPageSeo } from '../seo/documentMeta'
import { buildWebPageJsonLd, injectJsonLd } from '../seo/jsonLd'

const path = location.pathname
const title = document.querySelector('h1')?.textContent?.trim() ?? document.title
const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? ''

setupPageSeo(path)
injectJsonLd('json-ld-guide', buildWebPageJsonLd(path, title, description))
