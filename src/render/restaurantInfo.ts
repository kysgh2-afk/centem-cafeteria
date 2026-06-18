import type { Cafeteria } from '../types'
import { formatPrice, mapSearchUrl } from '../services/menuService'
import { getOperatingStatus, operatingStatusBadgeClass } from '../utils/operatingStatus'

function renderStatusBadge(cafeteria: Cafeteria): string {
  const status = getOperatingStatus(cafeteria)
  const badgeClass = operatingStatusBadgeClass(status.kind)
  const dotClass = status.kind === 'open' ? 'bg-green-500 animate-pulse' : 'bg-current opacity-40'

  return `
    <div class="mb-3">
      <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}">
        <span class="h-1.5 w-1.5 rounded-full ${dotClass}" aria-hidden="true"></span>
        ${status.label}
      </span>
      ${status.detail ? `<p class="text-xs text-slate-500 mt-1">${status.detail}</p>` : ''}
    </div>
  `
}

export function renderRestaurantInfoCards(cafeterias: Cafeteria[]): string {
  const cheapestLunch = Math.min(...cafeterias.map((c) => c.prices.lunch))

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      ${cafeterias
        .map((c) => {
          const isCheapest = c.prices.lunch === cheapestLunch
          return `
          <article
            class="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm"
            style="border-top: 3px solid ${c.color}"
          >
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 class="font-bold text-slate-900">${c.shortName}</h3>
                <p class="text-xs text-slate-500 mt-0.5">${c.building}</p>
              </div>
              ${isCheapest ? `<span class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">최저가</span>` : ''}
            </div>

            <p class="text-sm text-slate-600 leading-relaxed mb-3">${c.landmark} · ${c.floor}</p>
            ${renderStatusBadge(c)}
            <p class="text-sm text-slate-600 mb-1">${c.address}</p>

            <div class="space-y-1.5 mb-3">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">점심</span>
                <span class="font-semibold">${formatPrice(c.prices.lunch)}</span>
              </div>
              ${
                c.prices.dinner
                  ? `<div class="flex justify-between text-sm">
                      <span class="text-slate-500">저녁</span>
                      <span class="font-semibold">${formatPrice(c.prices.dinner)}</span>
                    </div>`
                  : ''
              }
            </div>

            <p class="text-xs text-slate-400 mb-3">${c.hours.lunch}${c.hours.dinner ? ` · ${c.hours.dinner}` : ''}</p>
            ${c.notes ? `<p class="text-xs text-slate-500 mb-2">${c.notes}</p>` : ''}
            ${c.parkingInfo ? `<p class="text-xs text-slate-500 mb-2">${c.parkingInfo}</p>` : ''}
            ${
              c.tips?.length
                ? `<ul class="text-xs text-slate-500 mb-3 space-y-1 list-disc pl-4">
                    ${c.tips.map((tip) => `<li>${tip}</li>`).join('')}
                  </ul>`
                : ''
            }

            <a
              href="${mapSearchUrl(c.mapQuery)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              지도 보기 →
            </a>
          </article>
        `
        })
        .join('')}
    </div>
  `
}
