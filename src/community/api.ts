import type { CommunityDetailResponse, CommunityListResponse } from './types'

const endpoint = '/api/community.php'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json', ...(options?.body ? { 'Content-Type': 'application/json' } : {}) },
    ...options,
  })
  const payload = await response.json().catch(() => ({ error: '서버 응답을 확인할 수 없습니다.' })) as T & { error?: string }
  if (!response.ok || payload.error) throw new Error(payload.error || '요청을 처리하지 못했습니다.')
  return payload
}

export function fetchPosts(category: string, query: string, page: number): Promise<CommunityListResponse> {
  const params = new URLSearchParams({ action: 'list', category, q: query, page: String(page) })
  return request(`${endpoint}?${params}`)
}

export function fetchPost(id: string): Promise<CommunityDetailResponse> {
  const params = new URLSearchParams({ action: 'detail', id })
  return request(`${endpoint}?${params}`)
}

export function postAction<T>(action: string, body: Record<string, unknown>): Promise<T> {
  return request(`${endpoint}?action=${encodeURIComponent(action)}`, { method: 'POST', body: JSON.stringify(body) })
}
