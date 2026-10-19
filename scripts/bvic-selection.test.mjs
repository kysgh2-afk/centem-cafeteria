import test from 'node:test'
import assert from 'node:assert/strict'
import { selectCurrentBvicPost, weekFromBvicPost } from './bvic-selection.mjs'

const posts = [
  { ntc_id: 3, ntc_title: '9월 5주 식단표_(주)stxf&c', ntc_stt_dt: '2026-09-28', ntc_end_dt: '2026-10-02' },
  { ntc_id: 2, ntc_title: '9월 4주 식단표_(주)stxf&c', ntc_stt_dt: '2026-09-21', ntc_end_dt: '2026-09-25' },
  { ntc_id: 1, ntc_title: '9월 3주 식단표_(주)stxf&c', ntc_stt_dt: '2026-09-14', ntc_end_dt: '2026-09-18' },
]

test('다음 주 게시글보다 오늘이 포함된 진행 중 식단표를 선택한다', () => {
  assert.equal(selectCurrentBvicPost(posts, '2026-09-22')?.ntc_id, 2)
})

test('현재 진행 중인 게시글이 없으면 미래 게시글로 대체하지 않는다', () => {
  assert.equal(selectCurrentBvicPost(posts, '2026-09-27'), null)
})

test('진행 중인 만족도조사 공지보다 실제 이번 주 식단표를 선택한다', () => {
  const candidates = [
    { ntc_id: 10026, ntc_title: '2026 영상산업센터 구내식당 만족도조사 진행 안내', ntc_stt_dt: '2026-10-12', ntc_end_dt: '2026-10-23' },
    { ntc_id: 10025, ntc_title: '10월 3주 식단표_(주)stxf&c', ntc_stt_dt: '2026-10-19', ntc_end_dt: '2026-10-23' },
  ]
  assert.equal(selectCurrentBvicPost(candidates, '2026-10-19')?.ntc_id, 10025)
})

test('제목에 식단표가 언급된 설문과 제목 없는 공지는 제외한다', () => {
  const period = { ntc_stt_dt: '2026-10-19', ntc_end_dt: '2026-10-23' }
  assert.equal(selectCurrentBvicPost([
    { ...period, ntc_title: '식단표 만족도 설문조사' },
    { ...period, ntc_title: '구내식당 운영 안내' },
    period,
  ], '2026-10-19'), null)
})

test('식단표 제목 공백을 정규화하되 적용 기간은 계속 확인한다', () => {
  const spaced = { ntc_id: 10, ntc_title: '10월 3주 식 단 표', ntc_stt_dt: '2026-10-19', ntc_end_dt: '2026-10-23' }
  assert.equal(selectCurrentBvicPost([spaced], '2026-10-19')?.ntc_id, 10)
  assert.equal(selectCurrentBvicPost([spaced], '2026-10-24'), null)
})

test('게시 기간을 주간 식단 메타데이터로 사용한다', () => {
  assert.deepEqual(weekFromBvicPost(posts[1]), {
    id: '2026-09-21',
    weekStart: '2026-09-21',
    weekEnd: '2026-09-25',
    title: '9월 21일 ~ 9월 25일',
  })
})
