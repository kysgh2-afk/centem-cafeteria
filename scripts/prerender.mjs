import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const root = resolve(import.meta.dirname, '..')
const server = await createServer({ root, configFile: false, server: { middlewareMode: true }, appType: 'custom' })
try {
  const loadJson = async path => JSON.parse(await readFile(resolve(root, 'public', path), 'utf8'))
  const [cafeterias, weekIndex] = await Promise.all([loadJson('data/cafeterias.json'), loadJson('data/weeks/index.json')])
  const data = { cafeterias: cafeterias.cafeterias, weekIndex, week: await loadJson(`data/weeks/${weekIndex.currentWeekId}.json`) }
  const home = await server.ssrLoadModule('/src/render/staticHome.ts')
  const pages = [['index.html', home.renderStaticHome(data)]]
  for (const [id, name] of [['stx', 'Stx'], ['partibox', 'Partibox'], ['schmaus', 'Schmaus'], ['jeongdam', 'Jeongdam']]) {
    const module = await server.ssrLoadModule(`/src/${id}/app.ts`)
    pages.push([`${id}.html`, module[`render${name}Page`]().replace(/\ssrc=""/g, '')])
  }
  for (const [page, body] of pages) {
    const path = resolve(root, 'dist', page)
    const html = await readFile(path, 'utf8')
    if (!html.includes('<div id="app"></div>')) throw new Error(`Prerender placeholder missing: ${page}`)
    await writeFile(path, html.replace('<div id="app"></div>', `<div id="app">${body}</div>`))
  }
  console.log(`Pre-rendered ${pages.length} pages with public menu data and photo guides.`)
} finally {
  await server.close()
}
