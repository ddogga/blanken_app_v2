import type { PageResponse } from '../types/common'
import type {
  CreateQuizSetRequest,
  QuizSetOrder,
  QuizSetResponse,
} from '../types/quizSet'
import { apiClient } from './client'

type GetUserQuizSetsParams = {
  userId: number
  order: QuizSetOrder
  page: number // 0부터
  size: number
}

// GET /api/quiz-sets/users/{userId} — 해당 유저가 만든 퀴즈셋 목록
export const getUserQuizSets = async ({
  userId,
  order,
  page,
  size,
}: GetUserQuizSetsParams): Promise<PageResponse<QuizSetResponse>> => {
  const res = await apiClient.get<PageResponse<QuizSetResponse>>(
    `/api/quiz-sets/users/${userId}`,
    // orderEnum은 필수. 빠지면 400
    { params: { orderEnum: order, page, size } },
  )
  return res.data
}

// POST /api/quiz-sets — 퀴즈 없이 퀴즈셋만 만든다(quizCount 0). 201 + 생성된 퀴즈셋
export const createQuizSet = async (
  request: CreateQuizSetRequest,
): Promise<QuizSetResponse> => {
  const res = await apiClient.post<QuizSetResponse>('/api/quiz-sets', request)
  return res.data
}
