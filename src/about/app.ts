import { aboutContent, siteMeta, subPageNavLinks } from '../content/siteContent'
import { renderAboutSectionArticle, renderFooter } from '../render/layout'

export function renderAboutHeader(): string {
  return `
    <header class="subpage-header">
      <div class="subpage-header__inner max-w-3xl mx-auto px-4 sm:px-6">
        <nav aria-label="주요 메뉴" class="subpage-header__nav">
          <ul>
            ${subPageNavLinks
              .map(
                (link) =>
                  `<li><a href="${link.href}">${link.label}</a></li>`,
              )
              .join('')}
          </ul>
        </nav>

        <p class="subpage-header__kicker">
          <a href="/" class="hover:underline">${siteMeta.name}</a>
        </p>
        <h1 class="subpage-header__title">${aboutContent.title}</h1>
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
