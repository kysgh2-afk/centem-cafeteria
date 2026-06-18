#!/usr/bin/env node
/**
 * 센텀시티 구내식당 식단표 자동 업데이트
 * - 생기방랑 RSS: STX, 파티박스, 다와푸드 센텀점, 만나
 * - 네이버 블로그: 다와푸드 큐비e센텀점
 * - 카카오채널: 슈마우스, 삼촌밥차, 정담식당
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'public', 'data', 'weeks')

const PORTLOCKROY_RSS = 'https://portlockroy.me/rss'
const PORTLOCKROY_KEYWORD = '센텀시티 구내식당 식단표'
const PORTLOCKROY_IDS = ['stx', 'partibox', 'dawa', 'manna']

const NAVER_BLOG = {
  'dawa-qubi': {
    rssUrl: 'https://rss.blog.naver.com/dawafood-qubi.xml',
    blogId: 'dawafood-qubi',
    titleKeyword: '이번주 메뉴',
  },
}

const KAKAO_CHANNELS = {
  schmaus: '_CiVis',
  'uncle-bapcha': '_FxbaQC',
  jeongdam: '_vKxgdn',
}

const USER_AGENT = 'Mozilla/5.0 (compatible; CentumCafeteriaBot/1.0)'

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function parseRssItems(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
    const linkRaw = block.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/)?.[1]
      ?? block.match(/<link>(.*?)<\/link>/)?.[1]
    const link = linkRaw?.trim()
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]

    if (title && link) {
      items.push({ title: decodeHtml(title.trim()), link: link.trim(), pubDate })
    }
  }

  return items
}

function parseWeekDates(title) {
  const match = title.match(/(\d+)월\s*(\d+)일\s*[-–]\s*(\d+)월\s*(\d+)일/)
    ?? title.match(/(\d+)월\s*(\d+)일\s*[-–]\s*(\d+)일/)

  if (!match) return null

  const year = title.match(/(\d{4})년/)?.[1] ?? String(new Date().getFullYear())
  const startMonth = match[1].padStart(2, '0')
  const startDay = match[2].padStart(2, '0')

  let endMonth, endDay
  if (match.length >= 5 && match[3].length <= 2) {
    endMonth = match[3].padStart(2, '0')
    endDay = match[4].padStart(2, '0')
  } else {
    endMonth = startMonth
    endDay = match[3].padStart(2, '0')
  }

  return {
    weekStart: `${year}-${startMonth}-${startDay}`,
    weekEnd: `${year}-${endMonth}-${endDay}`,
    title: `${Number(startMonth)}월 ${Number(startDay)}일 – ${Number(endMonth)}월 ${Number(endDay)}일`,
    id: `${year}-${startMonth}-${startDay}`,
  }
}

function isMenuImage(src) {
  return src.includes('blog.kakaocdn.net') && !src.includes('thumb/C')
}

function extractArticleContent(html) {
  const match = html.match(/<div class="article-view">([\s\S]*?)<div class="container_postbtn"/)
  return match?.[1] ?? html
}

function extractPortlockroyImages(html) {
  const menuImages = [...extractArticleContent(html).matchAll(/<img[^>]+src="([^"]+)"/gi)]
    .map((m) => m[1])
    .filter(isMenuImage)

  const images = {}
  PORTLOCKROY_IDS.forEach((id, i) => {
    if (menuImages[i]) images[id] = menuImages[i]
  })
  return images
}

function extractNaverImages(html) {
  const urls = [
    ...html.matchAll(/data-lazy-src="([^"]+)"/gi),
    ...html.matchAll(/<img[^>]+src="([^"]+)"/gi),
    ...html.matchAll(/https:\/\/postfiles\.pstatic\.net\/[^"'\s>)]+/g),
    ...html.matchAll(/https:\/\/blogfiles\.pstatic\.net\/[^"'\s>)]+/g),
  ]
    .map((m) => m[1] ?? m[0])
    .filter((url) =>
      (url.includes('postfiles.pstatic.net') || url.includes('blogfiles.pstatic.net')) &&
      !url.includes('/title?') &&
      !url.endsWith('.net'),
    )

  return [...new Set(urls)][0] ?? null
}

function pickKakaoImage(post) {
  const media = post?.media ?? []
  if (media.length === 0) return null

  const sorted = [...media].sort((a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0))
  const best = sorted[0]
  return best?.xlarge_url ?? best?.url ?? null
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`Fetch failed (${response.status}): ${url}`)
  return response.text()
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Fetch failed (${response.status}): ${url}`)
  return response.json()
}

async function fetchPortlockroyWeek() {
  const rssXml = await fetchText(PORTLOCKROY_RSS)
  const items = parseRssItems(rssXml)
  const menuPost = items.find((item) => item.title.includes(PORTLOCKROY_KEYWORD))

  if (!menuPost) throw new Error('생기방랑 최신 식단표 게시글을 찾지 못했습니다.')

  const weekInfo = parseWeekDates(menuPost.title)
  if (!weekInfo) throw new Error(`주간 날짜 파싱 실패: ${menuPost.title}`)

  const html = await fetchText(menuPost.link)

  return {
    ...weekInfo,
    sourceUrl: menuPost.link,
    menuImages: extractPortlockroyImages(html),
  }
}

async function fetchNaverBlogMenu(id, config) {
  const rssXml = await fetchText(config.rssUrl)
  const items = parseRssItems(rssXml)
  const menuPost = items.find((item) => item.title.includes(config.titleKeyword))

  if (!menuPost) {
    console.warn(`[${id}] 네이버 블로그 메뉴 게시글 없음`)
    return { sourceUrl: `https://blog.naver.com/${config.blogId}` }
  }

  const logNo = menuPost.link.match(/\/(\d+)(?:\?|$)/)?.[1]
  const postUrl = logNo
    ? `https://blog.naver.com/PostView.naver?blogId=${config.blogId}&logNo=${logNo}&redirect=Dlog&widgetTypeCall=true&directAccess=true`
    : menuPost.link

  const html = await fetchText(postUrl)
  const imageUrl = extractNaverImages(html)

  return {
    imageUrl,
    sourceUrl: menuPost.link,
  }
}

async function fetchKakaoChannelMenu(id, profileId) {
  try {
    const profile = await fetchJson(`https://pf.kakao.com/rocket-web/web/v2/profiles/${profileId}`)
    const postCard = profile.cards?.find((card) => card.type === 'post' && card.posts?.length)
    const latestPost = postCard?.posts?.[0]

    if (latestPost) {
      const imageUrl = pickKakaoImage(latestPost)
      if (imageUrl) {
        return { imageUrl, sourceUrl: latestPost.permalink ?? `https://pf.kakao.com/${profileId}` }
      }
    }
  } catch (error) {
    console.warn(`[${id}] 카카오 v2 프로필 조회 실패: ${error.message}`)
  }

  const postsData = await fetchJson(`https://pf.kakao.com/rocket-web/web/profiles/${profileId}/posts?size=5`)
  const latestPost = postsData.posts?.[0] ?? postsData.items?.[0]
  const imageUrl = pickKakaoImage(latestPost)

  return {
    imageUrl,
    sourceUrl: latestPost?.permalink ?? `https://pf.kakao.com/${profileId}`,
  }
}

async function fetchAllMenus() {
  const week = await fetchPortlockroyWeek()
  const menuImages = { ...week.menuImages }
  const menuSourceUrls = {}

  for (const id of PORTLOCKROY_IDS) {
    menuSourceUrls[id] = week.sourceUrl
  }

  for (const [id, config] of Object.entries(NAVER_BLOG)) {
    try {
      const result = await fetchNaverBlogMenu(id, config)
      if (result.imageUrl) menuImages[id] = result.imageUrl
      menuSourceUrls[id] = result.sourceUrl
      console.log(`[${id}] ${result.imageUrl ? '이미지 추출' : '출처만 저장 (표 형식 메뉴)'}`)
    } catch (error) {
      console.warn(`[${id}] 수집 실패: ${error.message}`)
      menuSourceUrls[id] = `https://blog.naver.com/${config.blogId}`
    }
  }

  for (const [id, profileId] of Object.entries(KAKAO_CHANNELS)) {
    try {
      const result = await fetchKakaoChannelMenu(id, profileId)
      if (result.imageUrl) menuImages[id] = result.imageUrl
      menuSourceUrls[id] = result.sourceUrl
      console.log(`[${id}] ${result.imageUrl ? '이미지 추출' : '이미지 없음'}`)
    } catch (error) {
      console.warn(`[${id}] 수집 실패: ${error.message}`)
      menuSourceUrls[id] = `https://pf.kakao.com/${profileId}`
    }
  }

  return {
    ...week,
    menuImages,
    menuSourceUrls,
    updatedAt: new Date().toISOString().slice(0, 10),
  }
}

async function updateIndex(weekInfo) {
  const indexPath = join(DATA_DIR, 'index.json')
  let index

  try {
    index = JSON.parse(await readFile(indexPath, 'utf-8'))
  } catch {
    index = { currentWeekId: weekInfo.id, weeks: [] }
  }

  index.currentWeekId = weekInfo.id

  const existing = index.weeks.findIndex((w) => w.id === weekInfo.id)
  const entry = {
    id: weekInfo.id,
    weekStart: weekInfo.weekStart,
    weekEnd: weekInfo.weekEnd,
    title: weekInfo.title,
  }

  if (existing >= 0) {
    index.weeks[existing] = entry
  } else {
    index.weeks.unshift(entry)
  }

  index.weeks = index.weeks.slice(0, 12)
  await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf-8')
}

async function updateWeekFile(weekInfo) {
  const weekPath = join(DATA_DIR, `${weekInfo.id}.json`)
  let weekData

  try {
    weekData = JSON.parse(await readFile(weekPath, 'utf-8'))
  } catch {
    weekData = {
      weekStart: weekInfo.weekStart,
      weekEnd: weekInfo.weekEnd,
      title: weekInfo.title,
      menus: {},
    }
  }

  weekData.weekStart = weekInfo.weekStart
  weekData.weekEnd = weekInfo.weekEnd
  weekData.title = weekInfo.title
  weekData.sourceUrl = weekInfo.sourceUrl
  weekData.updatedAt = weekInfo.updatedAt
  weekData.menuImages = { ...weekData.menuImages, ...weekInfo.menuImages }
  weekData.menuSourceUrls = { ...weekData.menuSourceUrls, ...weekInfo.menuSourceUrls }

  delete weekData.ocrRaw
  delete weekData.parsedFromOcr
  delete weekData.parsedAt

  await writeFile(weekPath, JSON.stringify(weekData, null, 2) + '\n', 'utf-8')
}

async function main() {
  console.log('센텀시티 구내식당 식단표 업데이트 시작...')
  await mkdir(DATA_DIR, { recursive: true })

  const weekInfo = await fetchAllMenus()
  console.log(`최신 주간: ${weekInfo.title}`)
  console.log(`기준 출처: ${weekInfo.sourceUrl}`)
  console.log(`식단표 이미지 ${Object.keys(weekInfo.menuImages).length}개 추출`)

  await updateWeekFile(weekInfo)
  await updateIndex(weekInfo)

  console.log('업데이트 완료!')
  console.log(`파일: public/data/weeks/${weekInfo.id}.json`)
}

main().catch((err) => {
  console.error('업데이트 실패:', err.message)
  process.exit(1)
})
