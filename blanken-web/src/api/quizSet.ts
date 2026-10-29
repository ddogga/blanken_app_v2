import type { PageResponse } from '../types/common'
import type { QuizSetOrder, QuizSetResponse } from '../types/quizSet'
import { SAMPLE_QUIZ_SETS } from './mocks/quizSets'

// TODO: 서버 연결 시 GET /api/quiz-sets/users/{userId}?orderEnum={order} 호출로 교체한다.
// 지금은 샘플 데이터를 서버처럼 정렬해서 돌려준다.
export const getMyQuizSets = async (
  order: QuizSetOrder,
): Promise<PageResponse<QuizSetResponse>> => {
  const content = [...SAMPLE_QUIZ_SETS].sort((a, b) =>
    order === 'LIKE_COUNT_DESC'
      ? b.likeCount - a.likeCount
      : b.createdAt.localeCompare(a.createdAt),
  )
  return {
    content,
    page: 0,
    size: 20,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    first: true,
    last: true,
  }
}
