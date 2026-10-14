import { access, cp, mkdir, mkdtemp, open, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile, spawnSync } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const jobDir = dirname(fileURLToPath(import.meta.url))
const publicRoot = resolve(process.env.CENTUM_PUBLIC_ROOT ?? join(jobDir, '..'))
const privateRoot = resolve(publicRoot, '..', 'tmp', 'centum-menu-scheduler')
const lockPath = join(privateRoot, 'update.lock')
const statusPath = join(publicRoot, 'data/menu-update-status.json')
const renderer = spawnSync('pdftoppm', ['-v'], { timeout: 10000 }).status === 0 ? 'pdftoppm'
  : spawnSync('gs', ['--version'], { timeout: 10000 }).status === 0 ? 'gs' : null
const now = () => new Date().toISOString()
const dayKst = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

async function atomicWrite(path, contents) {
  await mkdir(dirname(path), { recursive: true })
  const temp = `${path}.centum-${process.pid}.tmp`
  try { await writeFile(temp, contents); await rename(temp, path) }
  finally { await rm(temp, { force: true }) }
}

async function publishTree(source, destination) {
  await mkdir(destination, { recursive: true })
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name)
    const targetPath = join(destination, entry.name)
    if (entry.isDirectory()) await publishTree(sourcePath, targetPath)
    else if (entry.isFile()) await atomicWrite(targetPath, await readFile(sourcePath))
  }
}

async function acquireLock() {
  try { return await open(lockPath, 'wx', 0o600) }
  catch (error) {
    if (error.code !== 'EEXIST') throw error
    const lock = JSON.parse(await readFile(lockPath, 'utf8'))
    try { process.kill(lock.pid, 0); return null }
    catch (pidError) {
      if (pidError.code !== 'ESRCH') return null
      await rm(lockPath)
      return open(lockPath, 'wx', 0o600)
    }
  }
}

async function main() {
  if (Number(process.versions.node.split('.')[0]) < 20) throw new Error('Node 20 or later is required')
  await access(join(publicRoot, 'index.html'))
  await access(join(publicRoot, 'data/cafeterias.json'))
  const html = await readFile(join(publicRoot, 'index.html'), 'utf8')
  if (!html.includes('<!--centum-app:start-->') || !html.includes('<!--centum-app:end-->')) throw new Error('Home page update markers missing')
  if (!renderer) throw new Error('No PDF converter found (pdftoppm or gs required)')
  await mkdir(privateRoot, { recursive: true })
  const probe = join(privateRoot, `write-check-${process.pid}`)
  await writeFile(probe, 'check'); await rm(probe)
  if (process.argv.includes('--check')) {
    console.log(JSON.stringify({ ready: true, node: process.version, pdfConverter: renderer, serverTime: now(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, publicRoot, privateRoot }))
    return
  }
  const lock = await acquireLock()
  if (!lock) { console.log('Another menu update is already running; skipped.'); return }
  await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: now() }))
  const stage = await mkdtemp(join(privateRoot, 'run-'))
  const startedAt = now()
  let previousStatus = {}
  try { previousStatus = JSON.parse(await readFile(statusPath, 'utf8')) } catch { /* First server run. */ }
  const env = { ...process.env, CENTUM_MENU_DATA_DIR: join(stage, 'weeks'), CENTUM_PDF_RENDERER: renderer, CENTUM_BEXCO_DATA_PATH: join(stage, 'bexco-events.json') }
  try {
    await cp(join(publicRoot, 'data/weeks'), env.CENTUM_MENU_DATA_DIR, { recursive: true })
    const result = await run(process.execPath, [join(jobDir, 'fetch-menus.mjs')], { env, timeout: 8 * 60 * 1000, maxBuffer: 4 * 1024 * 1024 })
    process.stdout.write(result.stdout); process.stderr.write(result.stderr)
    const index = JSON.parse(await readFile(join(stage, 'weeks/index.json'), 'utf8'))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(index.currentWeekId)) throw new Error('Invalid menu week id')
    const week = JSON.parse(await readFile(join(stage, 'weeks', `${index.currentWeekId}.json`), 'utf8'))
    if (week.updatedAt !== dayKst()) throw new Error('Menu fetch did not produce a current collection result')
    for (const image of Object.values(week.menuImages ?? {})) {
      if (!String(image).startsWith('/data/weeks/assets/') || String(image).includes('..')) throw new Error('Unsafe menu image path')
      await access(join(stage, 'weeks', String(image).slice('/data/weeks/'.length)))
    }
    const { renderStaticHome } = await import('./render-home.mjs')
    const cafeteriaData = JSON.parse(await readFile(join(publicRoot, 'data/cafeterias.json'), 'utf8'))
    const newHtml = html.replace(/<!--centum-app:start-->[\s\S]*?<!--centum-app:end-->/, `<!--centum-app:start-->${renderStaticHome({ cafeterias: cafeteriaData.cafeterias, week, weekIndex: index })}<!--centum-app:end-->`)
    // Publish assets before JSON pointers; never expose half-written files.
    const assets = join(stage, 'weeks/assets', index.currentWeekId)
    try { await stat(assets); await publishTree(assets, join(publicRoot, 'data/weeks/assets', index.currentWeekId)) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    await atomicWrite(join(publicRoot, 'data/weeks', `${index.currentWeekId}.json`), await readFile(join(stage, 'weeks', `${index.currentWeekId}.json`)))
    await atomicWrite(join(publicRoot, 'data/weeks/index.json'), await readFile(join(stage, 'weeks/index.json')))
    await atomicWrite(join(publicRoot, 'index.html'), newHtml)
    let bexcoStatus = 'success'
    try {
      const events = await run(process.execPath, [join(jobDir, 'fetch-bexco-events.mjs')], { env, timeout: 3 * 60 * 1000 })
      process.stdout.write(events.stdout)
      await atomicWrite(join(publicRoot, 'data/bexco-events.json'), await readFile(env.CENTUM_BEXCO_DATA_PATH))
    } catch (error) { bexcoStatus = 'failed'; console.error('BEXCO update failed; previous events retained:', error.message) }
    const failedSources = Object.entries(week.menuMeta ?? {}).filter(([, meta]) => meta.fetchStatus === 'failed').map(([id]) => id)
    await atomicWrite(statusPath, JSON.stringify({ mode: 'server-cron', scheduledTime: '10:00 Asia/Seoul', startedAt, completedAt: now(), lastSuccessfulAt: now(), status: 'success', weekId: index.currentWeekId, failedSources, bexcoStatus }, null, 2) + '\n')
    console.log('Server menu update completed:', now())
  } catch (error) {
    await atomicWrite(statusPath, JSON.stringify({ ...previousStatus, mode: 'server-cron', startedAt, completedAt: now(), status: 'failed' }, null, 2) + '\n')
    throw error
  } finally {
    // Only this invocation's generated staging directory is removed.
    if (dirname(stage) === privateRoot && stage.startsWith(join(privateRoot, 'run-'))) await rm(stage, { recursive: true, force: true })
    await lock.close(); await rm(lockPath, { force: true })
  }
}

main().catch(error => { console.error('Server menu update failed:', error.message); process.exitCode = 1 })
