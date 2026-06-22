import { aboutContent, siteMeta, subPageNavLinks } from '../content/siteContent'
import { renderAboutSectionArticle, renderFooter } from '../render/layout'

export function renderAboutHeader(): string {
  return `
    <header class="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav aria-label="주요 메뉴" class="mb-6">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-emerald-50">
            ${subPageNavLinks
              .map(
                (link) =>
                  `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`,
              )
              .join('')}
          </ul>
        </nav>

        <p class="text-emerald-100 text-sm font-medium mb-2">
          <a href="/" class="hover:underline">${siteMeta.name}</a>
        </p>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${aboutContent.title}</h1>
      </div>
    </header>
  `
}

export function createAboutApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="min-h-screen">
      ${renderAboutHeader()}

      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        ${renderAboutSectionArticle()}
      </main>

      ${renderFooter(subPageNavLinks)}
    </div>
  `
}
