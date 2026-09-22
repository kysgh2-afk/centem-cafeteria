import test from 'node:test'
import assert from 'node:assert/strict'
import { selectCurrentBvicPost, weekFromBvicPost } from './bvic-selection.mjs'

const posts = [
  { ntc_id: 3, ntc_stt_dt: '2026-09-28', ntc_end_dt: '2026-10-02' },
  { ntc_id: 2, ntc_stt_dt: '2026-09-21', ntc_end_dt: '2026-09-25' },
  { ntc_id: 1, ntc_stt_dt: '2026-09-14', ntc_end_dt: '2026-09-18' },
]

test('다음 주 게시글보다 오늘이 포함된 진행 중 식단표를 선택한다', () => {
  assert.equal(selectCurrentBvicPost(posts, '2026-09-22')?.ntc_id, 2)
})

test('현재 진행 중인 게시글이 없으면 미래 게시글로 대체하지 않는다', () => {
  assert.equal(selectCurrentBvicPost(posts, '2026-09-27'), null)
})

test('게시 기간을 주간 식단 메타데이터로 사용한다', () => {
  assert.deepEqual(weekFromBvicPost(posts[1]), {
    id: '2026-09-21',
    weekStart: '2026-09-21',
    weekEnd: '2026-09-25',
    title: '9월 21일 ~ 9월 25일',
  })
})
