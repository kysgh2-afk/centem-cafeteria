#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_PATH = join(ROOT, 'public', 'data', 'bexco-events.json')
const IMAGE_DIR = join(ROOT, 'public', 'data', 'bexco', 'assets')
const BEXCO_ORIGIN = 'https://www.bexco.co.kr'
const SOURCE_URL = `${BEXCO_ORIGIN}/kor/CMS/EventScheduleMgr/list.do?mCode=MN214`
const USER_AGENT = 'Mozilla/5.0 (compatible; CentumCafeteriaBot/1.0)'

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function cleanText(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function absoluteUrl(url) {
  return new URL(url, BEXCO_ORIGIN).href
}

function parseEvents(html) {
  const list = html.match(/<div class="EventList">([\s\S]*?)<div class="paging-wrap">/)?.[1] ?? html
  const events = []

  for (const match of list.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
    const block = match[1]
    const detailPath = block.match(/<a href="([^"]*EventScheduleMgr\/view\.do[^"]*)"/)?.[1]
    const id = detailPath?.match(/event_seq=(\d+)/)?.[1]
    const rawType = cleanText(block.match(/<span class="eventIcon[^"]*">([\s\S]*?)<\/span>/)?.[1] ?? '')
    const title = cleanText(block.match(/<span class="subject">([\s\S]*?)<\/span>/)?.[1] ?? '')
    const dates = [...(block.match(/<span class="date">([\s\S]*?)<\/span>/)?.[1] ?? '').matchAll(/\d{4}-\d{2}-\d{2}/g)].map((item) => item[0])
    const place = cleanText(block.match(/<span class="place">([\s\S]*?)<\/span>/)?.[1] ?? '')
    const imagePath = block.match(/<img src="([^"]+)"/)?.[1]

    if (!id || !detailPath || !title || dates.length < 2) continue
    if (!['전시', '전시회', '이벤트', '공연', '이벤트·공연'].includes(rawType)) continue

    events.push({
      id,
      type: rawType.startsWith('전시') ? '전시회' : '이벤트·공연',
      title,
      startDate: dates[0],
      endDate: dates[1],
      place,
      detailUrl: absoluteUrl(detailPath),
      imageUrl: imagePath && !imagePath.includes('event_noimg') ? absoluteUrl(imagePath) : null,
    })
  }

  return events
}

function imageExtension(contentType) {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  return 'jpg'
}

async function cachePoster(event) {
  if (!event.imageUrl) return event

  try {
    const response = await fetch(event.imageUrl, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'image/*' },
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.startsWith('image/')) throw new Error(`Unexpected content type: ${contentType}`)
    const extension = imageExtension(contentType)
    await writeFile(join(IMAGE_DIR, `${event.id}.${extension}`), Buffer.from(await response.arrayBuffer()))
    return { ...event, imageUrl: `/data/bexco/assets/${event.id}.${extension}` }
  } catch (error) {
    console.warn(`[BEXCO ${event.id}] poster cache failed: ${error.message}`)
    return { ...event, imageUrl: null }
  }
}

async function main() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
  const monthEnd = `${today.slice(0, 8)}${new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0).getDate()}`
  const collected = []

  for (let page = 1; page <= 12; page += 1) {
    const pageUrl = page === 1 ? SOURCE_URL : `${SOURCE_URL}&page=${page}&robot=Y`
    const response = await fetch(pageUrl, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) throw new Error(`BEXCO schedule request failed: HTTP ${response.status}`)

    const pageEvents = parseEvents(await response.text())
    collected.push(...pageEvents)
    if (pageEvents.some((event) => event.startDate > monthEnd)) break
  }

  const events = [...new Map(collected.map((event) => [event.id, event])).values()]
    .filter((event) => event.endDate >= today && event.startDate <= monthEnd)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (!events.length) throw new Error('No public BEXCO exhibitions or events were found')

  await mkdir(IMAGE_DIR, { recursive: true })
  const cachedEvents = await Promise.all(events.map(cachePoster))
  const payload = {
    updatedAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    events: cachedEvents,
  }

  await writeFile(DATA_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`BEXCO events updated: ${cachedEvents.length}`)
}

main().catch((error) => {
  console.error('BEXCO event update failed:', error.message)
  process.exit(1)
})
