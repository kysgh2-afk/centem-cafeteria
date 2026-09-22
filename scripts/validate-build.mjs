import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')
const publicDir = join(root, 'public')
const expectedPages = [
  'index.html',
  'about.html',
  'privacy.html',
  'cafeteria-guide.html',
  'first-visit.html',
  'menu-policy.html',
  'partibox.html',
  'stx.html',
  'schmaus.html',
  'jeongdam.html',
  'bexco.html',
  'community.html',
]

const failures = []
const assert = (condition, message) => {
  if (!condition) failures.push(message)
}

for (const page of expectedPages) {
  assert(existsSync(join(dist, page)), `Missing built page: ${page}`)
}

const htmlFiles = readdirSync(dist).filter((name) => name.endsWith('.html'))
for (const htmlFile of htmlFiles) {
  const html = readFileSync(join(dist, htmlFile), 'utf8')
  const references = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1])
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|#|data:)/.test(reference) || reference.startsWith('/api/')) continue
    const pathname = reference.split(/[?#]/)[0]
    if (!pathname.startsWith('/')) continue
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
    assert(existsSync(join(dist, relative)), `${htmlFile} -> missing ${pathname}`)
  }
}

const robots = readFileSync(join(publicDir, 'robots.txt'), 'utf8')
assert(!robots.includes('Disallow: /data/'), 'robots.txt blocks public menu data')
assert(robots.includes('Disallow: /api/.data/'), 'robots.txt must keep private API data blocked')
assert(robots.includes('Disallow: /community-admin.html'), 'robots.txt must keep admin page blocked')

const sitemap = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8')
for (const page of expectedPages) {
  const pathname = page === 'index.html' ? 'https://centumlc.com/' : `https://centumlc.com/${page}`
  assert(sitemap.includes(`<loc>${pathname}</loc>`), `sitemap.xml is missing ${pathname}`)
}

const weekIndex = JSON.parse(readFileSync(join(publicDir, 'data/weeks/index.json'), 'utf8'))
const currentWeekPath = join(publicDir, 'data/weeks', `${weekIndex.currentWeekId}.json`)
assert(existsSync(currentWeekPath), `Current week file is missing: ${weekIndex.currentWeekId}`)
if (existsSync(currentWeekPath)) {
  const currentWeek = JSON.parse(readFileSync(currentWeekPath, 'utf8'))
  for (const imagePath of Object.values(currentWeek.menuImages ?? {})) {
    assert(existsSync(join(publicDir, String(imagePath).replace(/^\//, ''))), `Menu image is missing: ${imagePath}`)
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exit(1)
}

console.log(`Validated ${htmlFiles.length} built pages, internal assets, crawler rules, sitemap, and current menu data.`)
