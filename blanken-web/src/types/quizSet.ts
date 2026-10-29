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
