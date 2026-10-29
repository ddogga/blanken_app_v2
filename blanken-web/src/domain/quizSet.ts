import type { PageResponse } from '../types/common'
import type { QuizSetOrder, QuizSetResponse } from '../types/quizSet'

export const DEFAULT_QUIZ_SET_ORDER: QuizSetOrder = 'CREATE_AT_DESC'

export const QUIZ_SET_ORDER_OPTIONS: { value: QuizSetOrder; label: string }[] =
  [
    { value: 'CREATE_AT_DESC', label: '최신순' },
    { value: 'LIKE_COUNT_DESC', label: '인기순' },
  ]

export const isQuizSetOrder = (value: string): value is QuizSetOrder =>
  QUIZ_SET_ORDER_OPTIONS.some((option) => option.value === value)

export const QUIZ_SET_PAGE_SIZE = 20

// 서버 page는 0부터. 마지막 페이지면 더 요청하지 않는다(범위를 넘으면 빈 목록이 온다)
export const getNextQuizSetPage = (
  lastPage: PageResponse<QuizSetResponse>,
): number | undefined =>
  lastPage.last || lastPage.page + 1 >= lastPage.totalPages
    ? undefined
    : lastPage.page + 1

// 페이지를 이어 붙인다. 더보기 사이에 목록이 바뀌어 같은 퀴즈셋이 두 페이지에 걸치면 한 번만 남긴다
export const mergeQuizSetPages = (
  pages: PageResponse<QuizSetResponse>[],
): QuizSetResponse[] => {
  const seen = new Set<number>()
  const merged: QuizSetResponse[] = []
  for (const quizSet of pages.flatMap((page) => page.content)) {
    if (seen.has(quizSet.id)) continue
    seen.add(quizSet.id)
    merged.push(quizSet)
  }
  return merged
}

// 퀴즈가 하나도 없으면 학습할 수 없다 (2단계 생성 플로우에서 생성 직후 상태)
export const canStudyQuizSet = (quizSet: QuizSetResponse): boolean =>
  quizSet.quizCount > 0
