function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''))
}

export function todayInKst(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function selectCurrentBvicPost(posts, today = todayInKst()) {
  if (!isIsoDate(today)) throw new Error(`Invalid comparison date: ${today}`)

  return posts.find((post) => {
    const start = String(post?.ntc_stt_dt ?? '')
    const end = String(post?.ntc_end_dt ?? '')
    return isIsoDate(start) && isIsoDate(end) && start <= today && today <= end
  }) ?? null
}

export function weekFromBvicPost(post) {
  const start = String(post?.ntc_stt_dt ?? '')
  const end = String(post?.ntc_end_dt ?? '')
  if (!isIsoDate(start) || !isIsoDate(end)) throw new Error('BVIC menu period is invalid')

  const [, startMonth, startDay] = start.match(/\d{4}-(\d{2})-(\d{2})/) ?? []
  const [, endMonth, endDay] = end.match(/\d{4}-(\d{2})-(\d{2})/) ?? []

  return {
    id: start,
    weekStart: start,
    weekEnd: end,
    title: `${Number(startMonth)}월 ${Number(startDay)}일 ~ ${Number(endMonth)}월 ${Number(endDay)}일`,
  }
}
