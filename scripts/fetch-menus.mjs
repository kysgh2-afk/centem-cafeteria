#!/usr/bin/env node
/**
 * 센텀시티 구내식당 식단표 자동 업데이트 스크립트
 * 생기방랑 블로그 RSS에서 최신 주간 식단표 게시글을 찾아 이미지 URL을 추출합니다.
 *
 * 사용법: npm run update-menus
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'public', 'data', 'weeks')
const RSS_URL = 'https://portlockroy.me/rss'
const CATEGORY_KEYWORD = '센텀시티 구내식당 식단표'

const CAFETERIA_IDS = ['stx', 'partibox', 'dawa', 'manna']

function isMenuImage(src) {
  return src.includes('blog.kakaocdn.net') && !src.includes('thumb/C')
}

function extractArticleContent(html) {
  const match = html.match(/<div class="article-view">([\s\S]*?)<div class="container_postbtn"/)
  return match?.[1] ?? html
}

function extractMenuImages(content) {
  const menuImages = [...content.matchAll(/<img[^>]+src="([^"]+)"/gi)]
    .map((m) => m[1])
    .filter(isMenuImage)

  const images = {}
  CAFETERIA_IDS.forEach((id, i) => {
    if (menuImages[i]) images[id] = menuImages[i]
  })
  return images
}

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
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]
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

function extractImagesBySection(html) {
  return extractMenuImages(extractArticleContent(html))
}

async function fetchLatestPost() {
  const rssResponse = await fetch(RSS_URL)
  if (!rssResponse.ok) throw new Error(`RSS fetch failed: ${rssResponse.status}`)

  const rssXml = await rssResponse.text()
  const items = parseRssItems(rssXml)
  const menuPost = items.find((item) => item.title.includes(CATEGORY_KEYWORD))

  if (!menuPost) throw new Error('최신 식단표 게시글을 찾지 못했습니다.')

  const postResponse = await fetch(menuPost.link)
  if (!postResponse.ok) throw new Error(`Post fetch failed: ${postResponse.status}`)

  const html = await postResponse.text()
  const weekInfo = parseWeekDates(menuPost.title)

  if (!weekInfo) throw new Error(`주간 날짜 파싱 실패: ${menuPost.title}`)

  return {
    ...weekInfo,
    sourceUrl: menuPost.link,
    menuImages: extractImagesBySection(html),
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

  delete weekData.ocrRaw
  delete weekData.parsedFromOcr
  delete weekData.parsedAt

  await writeFile(weekPath, JSON.stringify(weekData, null, 2) + '\n', 'utf-8')
}

async function main() {
  console.log('센텀시티 구내식당 식단표 업데이트 시작...')
  await mkdir(DATA_DIR, { recursive: true })

  const weekInfo = await fetchLatestPost()
  console.log(`최신 주간: ${weekInfo.title}`)
  console.log(`출처: ${weekInfo.sourceUrl}`)

  const imageCount = Object.keys(weekInfo.menuImages).length
  console.log(`식단표 이미지 ${imageCount}개 추출`)

  await updateWeekFile(weekInfo)
  await updateIndex(weekInfo)

  console.log('업데이트 완료!')
  console.log(`파일: public/data/weeks/${weekInfo.id}.json`)
}

main().catch((err) => {
  console.error('업데이트 실패:', err.message)
  process.exit(1)
})
