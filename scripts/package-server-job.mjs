import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'vite'

const root = resolve(import.meta.dirname, '..')
const outDir = resolve(root, 'dist/maintenance')
await mkdir(outDir, { recursive: true })
// The production server only needs Node 20 and a PDF converter, not npm/Vite.
await build({
  root, configFile: false,
  build: { ssr: 'src/render/staticHome.ts', target: 'es2022', outDir, emptyOutDir: false,
    rollupOptions: { output: { entryFileNames: 'render-home.mjs' } } },
})
for (const file of ['fetch-menus.mjs', 'bvic-selection.mjs', 'fetch-bexco-events.mjs', 'server-menu-update.mjs']) {
  await copyFile(resolve(root, 'scripts', file), resolve(outDir, file))
}
console.log('Packaged CLI-only server menu job (no credentials or HTTP execution endpoint).')
