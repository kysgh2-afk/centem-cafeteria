import type { Cafeteria, CafeteriaId } from '../types'

export interface VoteData {
  date: string
  counts: Record<CafeteriaId, number>
  hasVoted: boolean
  votedFor: CafeteriaId | null
}

const VOTE_API = '/api/vote.php'

export async function fetchVotes(): Promise<VoteData> {
  const res = await fetch(VOTE_API)
  if (!res.ok) throw new Error('투표 정보를 불러오지 못했습니다.')
  return res.json()
}

export async function submitVote(cafeteriaId: CafeteriaId): Promise<VoteData> {
  const res = await fetch(VOTE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cafeteriaId }),
  })

  const data = await res.json()

  if (res.status === 409) {
    return {
      date: data.date,
      counts: data.counts,
      hasVoted: true,
      votedFor: data.votedFor ?? null,
    }
  }

  if (!res.ok) {
    throw new Error('투표에 실패했습니다.')
  }

  return {
    date: data.date,
    counts: data.counts,
    hasVoted: true,
    votedFor: data.votedFor ?? cafeteriaId,
  }
}

export function sortCafeteriasByVotes(
  cafeterias: Cafeteria[],
  counts: Record<CafeteriaId, number>,
): Cafeteria[] {
  return [...cafeterias].sort((a, b) => {
    const diff = (counts[b.id] ?? 0) - (counts[a.id] ?? 0)
    if (diff !== 0) return diff

    const original = cafeterias.map((c) => c.id)
    return original.indexOf(a.id) - original.indexOf(b.id)
  })
}

export function getVoteRanks(
  sorted: Cafeteria[],
  counts: Record<CafeteriaId, number>,
): Map<CafeteriaId, number> {
  const ranks = new Map<CafeteriaId, number>()

  sorted.forEach((cafeteria, index) => {
    if (index === 0) {
      ranks.set(cafeteria.id, 1)
      return
    }

    const prev = sorted[index - 1]
    const prevRank = ranks.get(prev.id) ?? index
    const sameCount = (counts[cafeteria.id] ?? 0) === (counts[prev.id] ?? 0)
    ranks.set(cafeteria.id, sameCount ? prevRank : index + 1)
  })

  return ranks
}

export function rankBadgeClass(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
    case 2:
      return 'bg-slate-200 text-slate-700 ring-1 ring-slate-300'
    case 3:
      return 'bg-orange-100 text-orange-800 ring-1 ring-orange-200'
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  }
}
