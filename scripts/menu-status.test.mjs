import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' })
after(() => server.close())
const { periodLabel, kstToday, renderMenuStatus } = await server.ssrLoadModule('/src/render/menuStatus.ts')

test('한국 시간과 적용 기간 경계로 현재·예정·지난 자료를 구분한다', () => {
  assert.equal(kstToday(new Date('2026-09-30T15:01:00Z')), '2026-10-01')
  assert.equal(periodLabel('2026-09-28', '2026-10-02', '2026-09-28'), '현재 적용 식단')
  assert.equal(periodLabel('2026-09-28', '2026-10-02', '2026-10-02'), '현재 적용 식단')
  assert.equal(periodLabel('2026-09-28', '2026-10-02', '2026-10-03'), '기간 지난 식단')
  assert.equal(periodLabel('2026-10-05', '2026-10-09', '2026-10-01'), '예정 식단')
  assert.equal(periodLabel(), '적용 날짜 확인 필요')
})

test('과거 메타데이터 없는 이미지를 이번 주 또는 최신으로 단정하지 않는다', () => {
  const html = renderMenuStatus({}, 'jeongdam', true)
  assert.match(html, /적용 날짜 확인 필요/)
  assert.match(html, /수집 시각 기록 없음/)
  assert.doesNotMatch(html, /현재 적용 식단/)
})

test('수집 실패와 이전 게시물 대체 상태가 이용자에게 드러난다', () => {
  assert.match(renderMenuStatus({ menuMeta: { stx: { fetchStatus: 'failed' } } }, 'stx', true), /최근 수집 실패/)
  assert.match(renderMenuStatus({ menuMeta: { 'uncle-bapcha': { fetchStatus: 'success', isFallback: true } } }, 'uncle-bapcha', true), /이전 게시물 대체 자료/)
  assert.match(renderMenuStatus({}, 'stx', false), /식단 자료 없음/)
})
