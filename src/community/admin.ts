import '../style.css'
import type { CommunityComment, CommunityPost } from './types'

interface AdminReport {
  id: string
  type: 'post' | 'comment'
  targetId: string
  reason: string
  createdAt: string
}

interface AdminResponse {
  posts: CommunityPost[]
  comments: CommunityComment[]
  reports: AdminReport[]
}

const root = document.querySelector<HTMLDivElement>('#app')!
const endpoint = '/api/community.php'
let adminPassword = sessionStorage.getItem('centum-community-admin') ?? ''
let data: AdminResponse | null = null
let error = ''

function escapeHtml(value: unknown): string {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function renderLogin(): void {
  root.innerHTML = `
    <main class="admin-login">
      <section>
        <a href="/community.html">← 커뮤니티로</a>
        <p>COMMUNITY ADMIN</p>
        <h1>커뮤니티 관리</h1>
        <p>운영자 비밀번호를 입력해 주세요.</p>
        ${error ? `<div class="community-error" role="alert">${escapeHtml(error)}</div>` : ''}
        <form data-admin-login>
          <label>운영자 비밀번호<input type="password" name="password" required autocomplete="current-password" /></label>
          <button class="community-primary" type="submit">관리 화면 열기</button>
        </form>
      </section>
    </main>
  `
  root.querySelector<HTMLFormElement>('[data-admin-login]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    adminPassword = String(new FormData(form).get('password') ?? '')
    sessionStorage.setItem('centum-community-admin', adminPassword)
    void loadAdmin()
  })
}

function renderDashboard(): void {
  if (!data) return
  const commentsByPost = new Map<string, CommunityComment[]>()
  data.comments.forEach((comment) => commentsByPost.set(comment.postId, [...(commentsByPost.get(comment.postId) ?? []), comment]))
  root.innerHTML = `
    <div class="admin-shell">
      <header><div><p>COMMUNITY ADMIN</p><h1>커뮤니티 관리</h1></div><div><a href="/community.html">게시판 보기</a><button type="button" data-logout>로그아웃</button></div></header>
      <main>
        <section class="admin-stats" aria-label="커뮤니티 현황">
          <article><span>게시글</span><strong>${data.posts.length}</strong></article>
          <article><span>댓글</span><strong>${data.comments.length}</strong></article>
          <article><span>미처리 신고</span><strong>${data.reports.length}</strong></article>
        </section>
        ${error ? `<div class="community-error" role="alert">${escapeHtml(error)}</div>` : ''}
        <section class="admin-list" aria-labelledby="posts-heading">
          <div class="admin-section-heading"><h2 id="posts-heading">게시글 관리</h2><button type="button" data-refresh>새로고침</button></div>
          ${data.posts.length ? data.posts.map((post) => `
            <article class="admin-post">
              <div class="admin-post-head"><span class="status-${post.status}">${post.status}</span><time>${formatDate(post.createdAt)}</time></div>
              <h3>${escapeHtml(post.title)}</h3>
              <p>${escapeHtml(post.body)}</p>
              <small>${escapeHtml(post.nickname)} · 댓글 ${(commentsByPost.get(post.id) ?? []).length} · 신고 ${post.reportCount ?? 0}</small>
              <div class="admin-actions">
                <button type="button" data-moderate="published" data-type="post" data-id="${post.id}">공개</button>
                <button type="button" data-moderate="hidden" data-type="post" data-id="${post.id}">숨김</button>
                <button type="button" data-moderate="deleted" data-type="post" data-id="${post.id}">삭제</button>
              </div>
              ${(commentsByPost.get(post.id) ?? []).map((comment) => `
                <div class="admin-comment"><p><strong>${escapeHtml(comment.nickname)}</strong> ${escapeHtml(comment.body)}</p><span>${comment.status} · 신고 ${comment.reportCount ?? 0}</span><button type="button" data-moderate="hidden" data-type="comment" data-id="${comment.id}">댓글 숨김</button><button type="button" data-moderate="published" data-type="comment" data-id="${comment.id}">댓글 공개</button></div>
              `).join('')}
            </article>
          `).join('') : '<p class="community-loading">등록된 게시글이 없습니다.</p>'}
        </section>
        <section class="admin-list" aria-labelledby="reports-heading">
          <div class="admin-section-heading"><h2 id="reports-heading">신고 내역</h2></div>
          ${data.reports.length ? data.reports.map((report) => `<article class="admin-report"><strong>${report.type === 'post' ? '게시글' : '댓글'} 신고</strong><p>${escapeHtml(report.reason)}</p><small>${formatDate(report.createdAt)} · ${escapeHtml(report.targetId)}</small><button type="button" data-resolve-report="${report.id}">처리 완료</button></article>`).join('') : '<p class="community-loading">미처리 신고가 없습니다.</p>'}
        </section>
      </main>
    </div>
  `
  bindDashboard()
}

async function api(action: string, body?: Record<string, unknown>): Promise<AdminResponse | { ok: boolean }> {
  const response = await fetch(`${endpoint}?action=${action}`, {
    method: body ? 'POST' : 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json', 'X-Admin-Password': adminPassword, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const payload = await response.json().catch(() => ({ error: '서버 응답 오류' })) as AdminResponse & { error?: string }
  if (!response.ok) throw new Error(payload.error || '요청을 처리하지 못했습니다.')
  return payload
}

async function loadAdmin(): Promise<void> {
  try {
    data = await api('admin-list') as AdminResponse
    error = ''
    renderDashboard()
  } catch (caught) {
    sessionStorage.removeItem('centum-community-admin')
    adminPassword = ''
    error = caught instanceof Error ? caught.message : '관리 화면을 열 수 없습니다.'
    renderLogin()
  }
}

function bindDashboard(): void {
  root.querySelector<HTMLButtonElement>('[data-logout]')?.addEventListener('click', () => {
    sessionStorage.removeItem('centum-community-admin')
    adminPassword = ''
    data = null
    renderLogin()
  })
  root.querySelector<HTMLButtonElement>('[data-refresh]')?.addEventListener('click', () => void loadAdmin())
  root.querySelectorAll<HTMLButtonElement>('[data-moderate]').forEach((button) => button.addEventListener('click', async () => {
    try {
      await api('admin-moderate', { id: button.dataset.id, type: button.dataset.type, status: button.dataset.moderate })
      await loadAdmin()
    } catch (caught) {
      error = caught instanceof Error ? caught.message : '처리하지 못했습니다.'
      renderDashboard()
    }
  }))
  root.querySelectorAll<HTMLButtonElement>('[data-resolve-report]').forEach((button) => button.addEventListener('click', async () => {
    try {
      await api('admin-resolve', { id: button.dataset.resolveReport })
      await loadAdmin()
    } catch (caught) {
      error = caught instanceof Error ? caught.message : '처리하지 못했습니다.'
      renderDashboard()
    }
  }))
}

if (adminPassword) void loadAdmin()
else renderLogin()
