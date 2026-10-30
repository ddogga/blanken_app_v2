import type { QuizRequest, QuizResponse } from './quiz'

export type Visibility = 'PUBLIC' | 'PRIVATE'

// 서버 QuizSetOrderEnum
export type QuizSetOrder = 'CREATE_AT_DESC' | 'LIKE_COUNT_DESC'

export type CategoryResponse = {
  id: number
  name: string
}

export type QuizSetResponse = {
  id: number
  ownerId: number
  ownerNickname: string | null
  title: string
  description: string | null
  visibility: Visibility
  likeCount: number
  quizCount: number
  category: CategoryResponse
  createdAt: string // ISO-8601 (서버 Instant)
  updatedAt: string
}

// POST /api/quiz-sets
export type CreateQuizSetRequest = {
  ownerId: number
  title: string
  description: string | null
  visibility: Visibility
  categoryId: number
}

// 퀴즈 목록을 포함한 퀴즈셋 (상세 조회, 수정 응답)
export type QuizSetDetailResponse = QuizSetResponse & {
  quizzes: QuizResponse[]
}

// PUT /api/quiz-sets/{id} — 전체 교체. quizzes에 없는 기존 퀴즈는 삭제된다
export type UpdateQuizSetRequest = {
  title: string
  description: string | null
  visibility: Visibility
  categoryId: number
  quizzes: QuizRequest[]
}
