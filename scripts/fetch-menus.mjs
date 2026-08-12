#!/usr/bin/env node
/**
 * 센텀시티 구내식당 식단표 자동 업데이트
 * - 생기방랑 RSS: STX, 파티박스, 다와푸드 센텀점, 만나
 * - 네이버 블로그: 다와푸드 큐비e센텀점
 * - 카카오채널: 슈마우스, 정담식당
 * - 인스타그램: 삼촌밥차런치펍
 */

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'public', 'data', 'weeks')
const IMAGE_DIR = join(DATA_DIR, 'assets')

const PORTLOCKROY_RSS = 'https://portlockroy.me/rss'
const PORTLOCKROY_KEYWORD = '센텀시티 구내식당 식단표'
const PORTLOCKROY_IDS = ['stx', 'partibox', 'dawa', 'manna']

const BVIC_BOARD_URL = 'https://www.bvic.kr/bvic/bbs/BBSCMML.do?_menuNo=36&bbs_id=NT_BBS_0500'
const BVIC_LIST_URL = 'https://www.bvic.kr/bvic/bbs/BBSCMML.json'
const BVIC_VIEW_URL = 'https://www.bvic.kr/bvic/bbs/BBSCMMV.do?_menuNo=36&bbs_id=NT_BBS_0500'
const BVIC_FILE_URL = 'https://www.bvic.kr/bvic/bbs/BBSCMMFileDown.do'

const NAVER_BLOG = {
  manna: {
    rssUrl: 'https://rss.blog.naver.com/jusik1606.xml',
    blogId: 'jusik1606',
    titleKeyword: '식단표',
    sourceUrl: 'https://blog.naver.com/jusik1606',
  },
  dawa: {
    rssUrl: 'https://rss.blog.naver.com/dawafood-centum.xml',
    blogId: 'dawafood-centum',
    titleKeyword: '메뉴',
    sourceUrl: 'https://blog.naver.com/dawafood-centum',
  },
  'dawa-qubi': {
    rssUrl: 'https://rss.blog.naver.com/dawafood-qubi.xml',
    blogId: 'dawafood-qubi',
    titleKeyword: '이번주 메뉴',
    sourceUrl: 'https://blog.naver.com/dawafood-qubi',
  },
}

const KAKAO_CHANNELS = {
  partibox: '_DCpLK',
  schmaus: '_CiVis',
  jeongdam: '_vKxgdn',
}

const INSTAGRAM_PROFILES = {
  'uncle-bapcha': { username: 'jnjskybiz', fallbackShortcode: 'Db7C18WPqAe' },
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

function stripTags(html) {
  return decodeHtml(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim())
}

function extractNaverMenuBoard(html) {
  const tableMatch = html.match(/<table class="se-table[^"]*"[\s\S]*?<\/table>/)
  if (!tableMatch) return null

  const rows = [...tableMatch[0].matchAll(/<tr class="se-tr">([\s\S]*?)<\/tr>/g)]
    .map((match) =>
      [...match[1].matchAll(/<td class="se-cell"[\s\S]*?(<p class="se-text-paragraph[\s\S]*?<\/p>)/g)]
        .map((cell) => stripTags(cell[1])),
    )
    .filter((row) => row.some(Boolean))

  if (!rows.length) return null

  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell.replace(/\n/g, '<br>')}</td>`).join('')}</tr>`,
    )
    .join('')

  return `<table class="menu-board-table"><tbody>${body}</tbody></table>`
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

  const first = media[0]
  return first?.xlarge_url ?? first?.url ?? null
}

async function fetchWithRetry(url, headers) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(15_000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000))
    }
  }
  throw new Error(`Fetch failed after 3 attempts: ${url} (${lastError?.message ?? 'unknown error'})`)
}

async function fetchText(url) {
  return (await fetchWithRetry(url, { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xml' })).text()
}

async function fetchJson(url) {
  return (await fetchWithRetry(url, { 'User-Agent': USER_AGENT, Accept: 'application/json' })).json()
}

function imageExtension(contentType) {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  return 'jpg'
}

function addDays(date, days) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function weekFromBvicPublication(publishedAt) {
  const published = new Date(`${publishedAt}T00:00:00Z`)
  const daysUntilMonday = published.getUTCDay() === 1 ? 0 : (8 - published.getUTCDay()) % 7
  const start = addDays(published, daysUntilMonday)
  const end = addDays(start, 4)

  return {
    id: formatDate(start),
    weekStart: formatDate(start),
    weekEnd: formatDate(end),
    title: `${start.getUTCMonth() + 1}월 ${start.getUTCDate()}일 ~ ${end.getUTCMonth() + 1}월 ${end.getUTCDate()}일`,
  }
}

function cookieHeader(response) {
  const cookies = response.headers.getSetCookie?.() ?? [response.headers.get('set-cookie')].filter(Boolean)
  return cookies.map((cookie) => cookie.split(';', 1)[0]).join('; ')
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'ignore', 'pipe'],
    })
    let stderr = ''
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with ${code}: ${stderr.trim()}`))
    })
  })
}

async function fetchBvicLatestMenu() {
  const listResponse = await fetchWithRetry(BVIC_BOARD_URL, {
    'User-Agent': USER_AGENT,
    Accept: 'text/html',
  })
  const listHtml = await listResponse.text()
  const cookie = cookieHeader(listResponse)
  const csrf = listHtml.match(/name=["']_csrf["'][^>]*value=["']([^"']+)/i)?.[1]
  if (!csrf) throw new Error('BVIC security token was not found')

  const baseForm = {
    _menuNo: '36',
    pageNo: '1',
    schSel: 'NTC_TITLE',
    schTxt: '',
    bbs_id: 'NT_BBS_0500',
    ntc_id: '',
    cudMode: '',
    _csrf: csrf,
  }
  const postHeaders = {
    'User-Agent': USER_AGENT,
    Accept: 'text/html,application/pdf',
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: cookie,
    Referer: BVIC_BOARD_URL,
  }
  const listDataResponse = await fetch(BVIC_LIST_URL, {
    method: 'POST',
    headers: { ...postHeaders, Accept: 'application/json' },
    body: new URLSearchParams(baseForm),
    signal: AbortSignal.timeout(15_000),
  })
  if (!listDataResponse.ok) throw new Error(`BVIC list request failed: HTTP ${listDataResponse.status}`)
  const listData = await listDataResponse.json()
  const latestPost = listData.dtList?.[0] ?? listData.topLst?.[0]
  const noticeId = String(latestPost?.ntc_id ?? '')
  const publishedAt = latestPost?.ins_dt
  if (!noticeId || !publishedAt) throw new Error('BVIC latest menu post was not found')

  const form = new URLSearchParams({ ...baseForm, ntc_id: noticeId })
  const viewResponse = await fetch(BVIC_VIEW_URL, {
    method: 'POST',
    headers: postHeaders,
    body: form,
    signal: AbortSignal.timeout(15_000),
  })
  if (!viewResponse.ok) throw new Error(`BVIC view request failed: HTTP ${viewResponse.status}`)
  const viewHtml = await viewResponse.text()
  const fileNo = viewHtml.match(/fFileDown\(['"]?(\d+)['"]?\)/i)?.[1]
  if (!fileNo) throw new Error('BVIC menu attachment was not found')

  const fileResponse = await fetch(`${BVIC_FILE_URL}?file_no=${fileNo}`, {
    method: 'POST',
    headers: { ...postHeaders, Referer: BVIC_VIEW_URL },
    body: form,
    signal: AbortSignal.timeout(20_000),
  })
  if (!fileResponse.ok) throw new Error(`BVIC file download failed: HTTP ${fileResponse.status}`)
  const pdf = Buffer.from(await fileResponse.arrayBuffer())
  if (pdf.subarray(0, 4).toString() !== '%PDF') {
    const contentType = fileResponse.headers.get('content-type') ?? ''
    throw new Error(`Unexpected BVIC attachment type: ${contentType}`)
  }

  return {
    ...weekFromBvicPublication(publishedAt),
    pdf,
    sourceUrl: BVIC_BOARD_URL,
  }
}

async function renderBvicMenuImage(weekId, pdf) {
  const tempDir = await mkdtemp(join(tmpdir(), 'centum-bvic-'))
  const pdfPath = join(tempDir, 'menu.pdf')
  const outputPrefix = join(tempDir, 'menu')
  const targetDir = join(IMAGE_DIR, weekId)
  const targetPath = join(targetDir, 'stx.png')

  try {
    await writeFile(pdfPath, pdf)
    const converter = process.platform === 'win32' ? 'pdftoppm.cmd' : 'pdftoppm'
    await runCommand(converter, ['-png', '-f', '1', '-singlefile', '-r', '150', pdfPath, outputPrefix])
    await mkdir(targetDir, { recursive: true })
    await writeFile(targetPath, await readFile(`${outputPrefix}.png`))
    return `/data/weeks/assets/${weekId}/stx.png`
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

async function cacheMenuImages(weekId, images) {
  const cached = {}
  const targetDir = join(IMAGE_DIR, weekId)
  await mkdir(targetDir, { recursive: true })

  for (const [id, rawUrl] of Object.entries(images)) {
    if (rawUrl.startsWith('/')) {
      cached[id] = rawUrl
      continue
    }
    const url = rawUrl.replace(/^http:/, 'https:')
    try {
      const response = await fetchWithRetry(url, {
        'User-Agent': USER_AGENT,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      })
      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.startsWith('image/')) throw new Error(`Unexpected content type: ${contentType}`)
      const extension = imageExtension(contentType)
      await writeFile(join(targetDir, `${id}.${extension}`), Buffer.from(await response.arrayBuffer()))
      cached[id] = `/data/weeks/assets/${weekId}/${id}.${extension}`
    } catch (error) {
      console.warn(`[${id}] 이미지 저장 실패: ${error.message}`)
    }
  }

  return cached
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
  let logNo = config.logNo

  if (!logNo) {
    const rssXml = await fetchText(config.rssUrl)
    const items = parseRssItems(rssXml)
    const menuPost = items.find((item) => item.title.includes(config.titleKeyword))
    logNo = menuPost?.link.match(/\/(\d+)(?:\?|$)/)?.[1]
  }

  if (!logNo) {
    const postListUrl = `https://blog.naver.com/PostList.naver?blogId=${config.blogId}&categoryNo=0&directAccess=true`
    const postListHtml = await fetchText(postListUrl)
    const candidates = [
      ...postListHtml.matchAll(new RegExp(`/${config.blogId}/(\\d{8,})`, 'g')),
      ...postListHtml.matchAll(/PostView\.naver\?[^"']*logNo=(\d{8,})/g),
    ]
    logNo = candidates[0]?.[1]
  }

  if (!logNo) {
    console.warn(`[${id}] 네이버 블로그 메뉴 게시글 없음`)
    return { sourceUrl: config.sourceUrl ?? `https://blog.naver.com/${config.blogId}` }
  }

  const postUrl = `https://blog.naver.com/PostView.naver?blogId=${config.blogId}&logNo=${logNo}&redirect=Dlog&widgetTypeCall=true&directAccess=true`
  const html = await fetchText(postUrl)
  const menuBoardHtml = extractNaverMenuBoard(html)
  const imageUrl = extractNaverImages(html)

  return {
    imageUrl,
    menuBoardHtml,
    sourceUrl: config.sourceUrl ?? `https://blog.naver.com/${config.blogId}/${logNo}`,
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

async function fetchInstagramMenu(id, { username, fallbackShortcode }) {
  const sourceUrl = `https://www.instagram.com/${username}/`
  const profileResponse = await fetchWithRetry(sourceUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
    Accept: 'text/html',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  })
  const profileHtml = await profileResponse.text()
  const csrfToken = profileHtml.match(/"csrf_token":"([^"]+)"/)?.[1] ?? ''
  const cookie = cookieHeader(profileResponse)
  try {
    const response = await fetchWithRetry(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
        Accept: 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'X-IG-App-ID': '936619743392459',
        'X-CSRFToken': csrfToken,
        Cookie: cookie,
        Referer: sourceUrl,
      },
    )
    const payload = await response.json()
    const post = payload?.data?.user?.edge_owner_to_timeline_media?.edges?.[0]?.node
    const imageUrl = post?.display_url ?? post?.thumbnail_src
    const shortcode = post?.shortcode
    if (imageUrl && shortcode) {
      return { imageUrl, sourceUrl: `https://www.instagram.com/${username}/p/${shortcode}/` }
    }
  } catch (error) {
    console.warn(`[${id}] 인스타그램 프로필 API 제한: ${error.message}`)
  }

  const postUrl = `https://www.instagram.com/${username}/p/${fallbackShortcode}/`
  const postHtml = await fetchText(postUrl)
  const imageUrl = decodeHtml(postHtml.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? '')
  if (!imageUrl) throw new Error('인스타그램 최신 게시물 이미지를 찾지 못했습니다.')
  return { imageUrl, sourceUrl: postUrl }
}

async function fetchAllMenus() {
  let bvicMenu
  try {
    bvicMenu = await fetchBvicLatestMenu()
    console.log(`[stx] BVIC latest menu: ${bvicMenu.weekStart}`)
  } catch (error) {
    console.warn(`[stx] BVIC fetch failed: ${error.message}`)
  }

  let portlockroyWeek
  try {
    portlockroyWeek = await fetchPortlockroyWeek()
  } catch (error) {
    console.warn(`[portlockroy] fetch failed: ${error.message}`)
  }

  if (!bvicMenu && !portlockroyWeek) throw new Error('No weekly menu source is available')

  const week = bvicMenu && (!portlockroyWeek || bvicMenu.weekStart >= portlockroyWeek.weekStart)
    ? bvicMenu
    : portlockroyWeek
  const menuImages = { ...(portlockroyWeek?.menuImages ?? {}) }
  const menuSourceUrls = {}
  const menuBoardHtml = {}

  for (const id of PORTLOCKROY_IDS) {
    menuSourceUrls[id] = portlockroyWeek?.sourceUrl ?? week.sourceUrl
  }

  if (bvicMenu) {
    menuImages.stx = await renderBvicMenuImage(week.id, bvicMenu.pdf)
    menuSourceUrls.stx = bvicMenu.sourceUrl
  }

  for (const [id, config] of Object.entries(NAVER_BLOG)) {
    try {
      const result = await fetchNaverBlogMenu(id, config)
      if (result.imageUrl) menuImages[id] = result.imageUrl
      if (result.menuBoardHtml) menuBoardHtml[id] = result.menuBoardHtml
      menuSourceUrls[id] = result.sourceUrl
      console.log(
        `[${id}] ${result.menuBoardHtml ? '메뉴판 표 추출' : result.imageUrl ? '이미지 추출' : '출처만 저장'}`,
      )
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

  for (const [id, profile] of Object.entries(INSTAGRAM_PROFILES)) {
    try {
      const result = await fetchInstagramMenu(id, profile)
      menuImages[id] = result.imageUrl
      menuSourceUrls[id] = result.sourceUrl
      console.log(`[${id}] 인스타그램 최신 이미지 추출`)
    } catch (error) {
      console.warn(`[${id}] 인스타그램 수집 실패: ${error.message}`)
      menuSourceUrls[id] = `https://www.instagram.com/${profile.username}/`
    }
  }

  return {
    ...week,
    sourceUrl: week.sourceUrl,
    menuImages,
    menuSourceUrls,
    menuBoardHtml,
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
  weekData.menuBoardHtml = { ...weekData.menuBoardHtml, ...weekInfo.menuBoardHtml }

  delete weekData.ocrRaw
  delete weekData.parsedFromOcr
  delete weekData.parsedAt

  await writeFile(weekPath, JSON.stringify(weekData, null, 2) + '\n', 'utf-8')
}

async function main() {
  console.log('센텀시티 구내식당 식단표 업데이트 시작...')
  await mkdir(DATA_DIR, { recursive: true })

  const weekInfo = await fetchAllMenus()
  weekInfo.menuImages = await cacheMenuImages(weekInfo.id, weekInfo.menuImages)
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
