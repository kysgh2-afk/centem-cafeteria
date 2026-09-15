import { renderFooter } from '../render/layout'
import { siteMeta, subPageNavLinks } from '../content/siteContent'
import { fetchPost, fetchPosts, postAction } from './api'
import type { CommunityDetailResponse, CommunityListResponse, CommunityPost } from './types'

type View = 'list' | 'detail' | 'write' | 'edit'

interface CommunityState {
  view: View
  query: string
  page: number
  list: CommunityListResponse | null
  detail: CommunityDetailResponse | null
  loading: boolean
  error: string | null
  notice: string | null
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function renderHeader(): string {
  return `
    <header class="community-hero text-white">
      <div class="community-grid-pattern" aria-hidden="true"></div>
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative">
        <nav aria-label="주요 메뉴" class="hero-nav mb-9">
          <a href="/" class="brand-mark" aria-label="센텀런치 홈">센텀런치</a>
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-emerald-50">
            ${subPageNavLinks.map((link) => `<li><a href="${link.href}" class="hover:text-white underline-offset-2 hover:underline">${link.label}</a></li>`).join('')}
          </ul>
        </nav>
        <p class="community-kicker">CENTUM PEOPLE · LOCAL BOARD</p>
        <h1>센텀 커뮤니티</h1>
        <p>센텀시티에서 일하며 알게 된 점심, 교통, 행사와 생활 정보를 나눠보세요.</p>
      </div>
    </header>
  `
}

function renderPostRow(post: CommunityPost): string {
  return `
    <article class="community-post-row">
      <button type="button" data-open-post="${escapeHtml(post.id)}" class="community-post-link">
        <span class="community-post-copy">
          <strong>${escapeHtml(post.title)}</strong>
          <small>${escapeHtml(post.nickname)} · ${formatDate(post.createdAt)}</small>
        </span>
        <span class="community-comment-count" aria-label="댓글 ${post.commentCount}개">댓글 ${post.commentCount}</span>
      </button>
    </article>
  `
}

function renderEmptyState(): string {
  return `
    <div class="community-empty">
      <span aria-hidden="true">✦</span>
      <h2>아직 등록된 소식이 없습니다</h2>
      <p>오늘 발견한 맛집이나 출퇴근 팁처럼 센텀 생활에 도움 되는 첫 정보를 남겨주세요.</p>
      <button type="button" data-write class="community-primary">첫 글 작성하기</button>
    </div>
  `
}

function renderPagination(data: CommunityListResponse): string {
  if (data.totalPages <= 1) return ''
  return `
    <nav class="community-pagination" aria-label="게시글 페이지">
      <button type="button" data-page="${data.page - 1}" ${data.page <= 1 ? 'disabled' : ''}>이전</button>
      <span>${data.page} / ${data.totalPages}</span>
      <button type="button" data-page="${data.page + 1}" ${data.page >= data.totalPages ? 'disabled' : ''}>다음</button>
    </nav>
  `
}

function renderList(state: CommunityState): string {
  return `
    <main class="community-main max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <section class="community-notice" aria-labelledby="community-notice-heading">
        <div><span>운영 안내</span><h2 id="community-notice-heading">서로에게 도움이 되는 센텀 정보만 나눠주세요</h2></div>
        <p>개인정보·회사 기밀·비방·광고성 글은 숨김 또는 삭제될 수 있습니다. 게시글 비밀번호는 수정·삭제할 때 사용합니다.</p>
      </section>

      <div class="community-toolbar community-toolbar-simple">
        <button type="button" data-write class="community-primary">글쓰기</button>
      </div>

      <form class="community-search" data-search-form role="search">
        <label class="sr-only" for="community-search-input">커뮤니티 검색</label>
        <input id="community-search-input" name="q" value="${escapeHtml(state.query)}" maxlength="40" placeholder="제목이나 내용 검색" />
        <button type="submit">검색</button>
      </form>

      ${state.notice ? `<p class="community-flash" role="status">${escapeHtml(state.notice)}</p>` : ''}
      ${state.error ? `<div class="community-error" role="alert">${escapeHtml(state.error)} <button type="button" data-retry>다시 시도</button></div>` : ''}
      ${state.loading ? '<div class="community-loading" role="status">게시글을 불러오는 중...</div>' : ''}
      ${!state.loading && state.list ? `
        <section class="community-board" aria-label="센텀 커뮤니티 게시글">
          <div class="community-board-heading"><strong>전체 ${state.list.total.toLocaleString('ko-KR')}건</strong><span>최신순</span></div>
          ${state.list.posts.length ? state.list.posts.map(renderPostRow).join('') : renderEmptyState()}
        </section>
        ${renderPagination(state.list)}
      ` : ''}
    </main>
  `
}

function renderComposer(state: CommunityState): string {
  const post = state.view === 'edit' ? state.detail?.post : null
  return `
    <main class="community-main community-narrow max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button type="button" data-back class="community-back">← 게시판으로</button>
      <section class="community-form-card" aria-labelledby="composer-heading">
        <p class="community-section-kicker">SHARE A LOCAL TIP</p>
        <h2 id="composer-heading">${post ? '게시글 수정' : '센텀 소식 나누기'}</h2>
        <p class="community-form-intro">업무 중 알게 된 유용한 지역 정보를 구체적으로 적어주시면 더 많은 사람에게 도움이 됩니다.</p>
        ${state.error ? `<div class="community-error" role="alert">${escapeHtml(state.error)}</div>` : ''}
        <form data-post-form>
          <label>닉네임<input name="nickname" required minlength="2" maxlength="12" value="${escapeHtml(post?.nickname ?? '익명')}" /></label>
          <label>제목<input name="title" required minlength="4" maxlength="80" value="${escapeHtml(post?.title ?? '')}" placeholder="내용을 한눈에 알 수 있게 적어주세요" /></label>
          <label>내용<textarea name="body" required minlength="10" maxlength="2000" rows="10" placeholder="장소, 시간, 이용 방법 등 필요한 내용을 적어주세요">${escapeHtml(post?.body ?? '')}</textarea><small>전화번호·이메일·회사 기밀·외부 링크는 입력하지 마세요.</small></label>
          <label>글 비밀번호<input name="password" type="password" required minlength="6" maxlength="30" autocomplete="new-password" placeholder="수정·삭제할 때 사용할 6자 이상 비밀번호" /></label>
          <label class="community-check"><input type="checkbox" name="agree" required /><span>개인정보·비방·광고성 내용을 올리지 않으며 커뮤니티 운영 원칙에 동의합니다.</span></label>
          <label class="community-honeypot" aria-hidden="true">홈페이지<input name="website" tabindex="-1" autocomplete="off" /></label>
          <div class="community-form-actions">
            <button type="button" data-back>취소</button>
            <button type="submit" class="community-primary" ${state.loading ? 'disabled' : ''}>${state.loading ? '저장 중...' : post ? '수정하기' : '등록하기'}</button>
          </div>
        </form>
      </section>
    </main>
  `
}

function renderDetail(state: CommunityState): string {
  const detail = state.detail
  if (!detail) return `<main class="community-main max-w-3xl mx-auto px-4 sm:px-6 py-10"><div class="community-loading">게시글을 불러오는 중...</div></main>`
  const { post, comments } = detail
  return `
    <main class="community-main community-narrow max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button type="button" data-back class="community-back">← 목록으로</button>
      ${state.notice ? `<p class="community-flash" role="status">${escapeHtml(state.notice)}</p>` : ''}
      ${state.error ? `<div class="community-error" role="alert">${escapeHtml(state.error)}</div>` : ''}
      <article class="community-detail">
        <h1>${escapeHtml(post.title)}</h1>
        <p class="community-detail-meta">${escapeHtml(post.nickname)} · ${formatDate(post.createdAt)}${post.updatedAt !== post.createdAt ? ' · 수정됨' : ''}</p>
        <div class="community-detail-body">${escapeHtml(post.body).replaceAll('\n', '<br />')}</div>
        <div class="community-detail-actions">
          <button type="button" data-edit-post>수정</button>
          <button type="button" data-delete-post>삭제</button>
          <button type="button" data-report-target="post" data-report-id="${escapeHtml(post.id)}">신고</button>
        </div>
      </article>

      <section class="community-comments" aria-labelledby="comments-heading">
        <h2 id="comments-heading">댓글 <span>${comments.length}</span></h2>
        <div class="community-comment-list">
          ${comments.length ? comments.map((comment) => `
            <article class="community-comment">
              <div><strong>${escapeHtml(comment.nickname)}</strong><time>${formatDate(comment.createdAt)}</time></div>
              <p>${escapeHtml(comment.body).replaceAll('\n', '<br />')}</p>
              <div><button type="button" data-delete-comment="${escapeHtml(comment.id)}">삭제</button><button type="button" data-report-target="comment" data-report-id="${escapeHtml(comment.id)}">신고</button></div>
            </article>
          `).join('') : '<p class="community-no-comments">첫 댓글을 남겨보세요.</p>'}
        </div>
        <form class="community-comment-form" data-comment-form>
          <div class="community-field-row">
            <label>닉네임<input name="nickname" required minlength="2" maxlength="12" value="익명" /></label>
            <label>댓글 비밀번호<input name="password" type="password" required minlength="6" maxlength="30" autocomplete="new-password" placeholder="삭제할 때 사용할 6자 이상 비밀번호" /></label>
          </div>
          <label>댓글<textarea name="body" required minlength="2" maxlength="500" rows="4" placeholder="서로 배려하는 댓글을 남겨주세요"></textarea></label>
          <label class="community-honeypot" aria-hidden="true">홈페이지<input name="website" tabindex="-1" autocomplete="off" /></label>
          <button type="submit" class="community-primary" ${state.loading ? 'disabled' : ''}>댓글 등록</button>
        </form>
      </section>
    </main>
  `
}

export function createCommunityApp(root: HTMLElement): void {
  const params = new URLSearchParams(location.search)
  const initialPostId = params.get('post')
  const state: CommunityState = {
    view: initialPostId ? 'detail' : 'list',
    query: '',
    page: 1,
    list: null,
    detail: null,
    loading: true,
    error: null,
    notice: null,
  }

  const render = () => {
    root.innerHTML = `<div class="min-h-screen">${renderHeader()}${state.view === 'list' ? renderList(state) : state.view === 'detail' ? renderDetail(state) : renderComposer(state)}${renderFooter(subPageNavLinks)}</div>`
    bindEvents()
  }

  const showList = async (notice: string | null = null, updateHistory = true) => {
    state.view = 'list'
    state.detail = null
    state.notice = notice
    if (updateHistory) history.pushState({}, '', '/community.html')
    await loadList()
  }

  const loadList = async () => {
    state.loading = true
    state.error = null
    render()
    try {
      state.list = await fetchPosts(state.query, state.page)
    } catch (error) {
      state.error = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.'
    } finally {
      state.loading = false
      render()
    }
  }

  const openPost = async (id: string, notice: string | null = null, updateHistory = true) => {
    state.view = 'detail'
    state.loading = true
    state.error = null
    state.notice = notice
    if (updateHistory) history.pushState({}, '', `/community.html?post=${encodeURIComponent(id)}`)
    render()
    try {
      state.detail = await fetchPost(id)
    } catch (error) {
      state.error = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.'
    } finally {
      state.loading = false
      render()
    }
  }

  const readForm = (form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())

  const bindEvents = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-write]').forEach((button) => button.addEventListener('click', () => {
      state.view = 'write'
      state.error = null
      state.notice = null
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }))
    root.querySelectorAll<HTMLButtonElement>('[data-back]').forEach((button) => button.addEventListener('click', () => void showList()))
    root.querySelector<HTMLButtonElement>('[data-retry]')?.addEventListener('click', () => void loadList())
    root.querySelector<HTMLFormElement>('[data-search-form]')?.addEventListener('submit', (event) => {
      event.preventDefault()
      const form = event.currentTarget as HTMLFormElement
      state.query = String(new FormData(form).get('q') ?? '').trim()
      state.page = 1
      void loadList()
    })
    root.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => button.addEventListener('click', () => {
      state.page = Number(button.dataset.page) || 1
      void loadList()
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }))
    root.querySelectorAll<HTMLButtonElement>('[data-open-post]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.openPost
      if (id) void openPost(id)
    }))

    root.querySelector<HTMLFormElement>('[data-post-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault()
      const form = event.currentTarget as HTMLFormElement
      if (!form.reportValidity()) return
      state.loading = true
      state.error = null
      render()
      try {
        const payload = readForm(form)
        if (state.view === 'edit' && state.detail) {
          await postAction('update', { ...payload, id: state.detail.post.id })
          await openPost(state.detail.post.id, '게시글을 수정했습니다.')
        } else {
          const result = await postAction<{ id: string }>('create', payload)
          await openPost(result.id, '게시글을 등록했습니다.')
        }
      } catch (error) {
        state.loading = false
        state.error = error instanceof Error ? error.message : '게시글을 저장하지 못했습니다.'
        render()
      }
    })

    root.querySelector<HTMLButtonElement>('[data-edit-post]')?.addEventListener('click', () => {
      state.view = 'edit'
      state.error = null
      render()
    })
    root.querySelector<HTMLButtonElement>('[data-delete-post]')?.addEventListener('click', async () => {
      if (!state.detail || !confirm('이 게시글을 삭제할까요?')) return
      const password = prompt('글 비밀번호를 입력해 주세요.')
      if (!password) return
      try {
        await postAction('delete', { type: 'post', id: state.detail.post.id, password })
        await showList('게시글을 삭제했습니다.')
      } catch (error) {
        state.error = error instanceof Error ? error.message : '삭제하지 못했습니다.'
        render()
      }
    })
    root.querySelectorAll<HTMLButtonElement>('[data-delete-comment]').forEach((button) => button.addEventListener('click', async () => {
      if (!state.detail) return
      const password = prompt('댓글 비밀번호를 입력해 주세요.')
      if (!password) return
      try {
        await postAction('delete', { type: 'comment', id: button.dataset.deleteComment, password })
        await openPost(state.detail.post.id, '댓글을 삭제했습니다.')
      } catch (error) {
        state.error = error instanceof Error ? error.message : '삭제하지 못했습니다.'
        render()
      }
    }))
    root.querySelectorAll<HTMLButtonElement>('[data-report-target]').forEach((button) => button.addEventListener('click', async () => {
      const reason = prompt('신고 사유를 입력해 주세요. (광고, 비방, 개인정보 등)')
      if (!reason) return
      try {
        await postAction('report', { type: button.dataset.reportTarget, id: button.dataset.reportId, reason })
        state.notice = '신고가 접수되었습니다. 운영자가 확인하겠습니다.'
        render()
      } catch (error) {
        state.error = error instanceof Error ? error.message : '신고하지 못했습니다.'
        render()
      }
    }))
    root.querySelector<HTMLFormElement>('[data-comment-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault()
      if (!state.detail) return
      const form = event.currentTarget as HTMLFormElement
      if (!form.reportValidity()) return
      try {
        const payload = readForm(form)
        await postAction('comment', { ...payload, postId: state.detail.post.id })
        await openPost(state.detail.post.id, '댓글을 등록했습니다.')
      } catch (error) {
        state.error = error instanceof Error ? error.message : '댓글을 등록하지 못했습니다.'
        render()
      }
    })
  }

  window.addEventListener('popstate', () => {
    const id = new URLSearchParams(location.search).get('post')
    if (id) void openPost(id, null, false)
    else void showList(null, false)
  })

  render()
  if (initialPostId) void openPost(initialPostId, null, false)
  else void loadList()
}

export { siteMeta }
