export type CommunityCategory = 'meal' | 'traffic' | 'event' | 'lost'

export interface CommunityPost {
  id: string
  category: CommunityCategory
  title: string
  body: string
  nickname: string
  createdAt: string
  updatedAt: string
  commentCount: number
  reportCount?: number
  status?: 'published' | 'hidden' | 'deleted'
}

export interface CommunityComment {
  id: string
  postId: string
  body: string
  nickname: string
  createdAt: string
  status?: 'published' | 'hidden' | 'deleted'
  reportCount?: number
}

export interface CommunityListResponse {
  posts: CommunityPost[]
  page: number
  totalPages: number
  total: number
}

export interface CommunityDetailResponse {
  post: CommunityPost
  comments: CommunityComment[]
}
