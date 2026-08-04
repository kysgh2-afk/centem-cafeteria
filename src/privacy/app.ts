import { privacyContent, subPageNavLinks, siteMeta } from '../content/siteContent'
import { renderFooter, renderPrivacySection } from '../render/layout'

export function renderPrivacyHeader(): string {
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
        <h1 class="subpage-header__title">${privacyContent.title}</h1>
      </div>
    </header>
  `
}

export function createPrivacyApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="min-h-screen">
      ${renderPrivacyHeader()}

      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        ${renderPrivacySection()}
      </main>

      ${renderFooter(subPageNavLinks)}
    </div>
  `
}
