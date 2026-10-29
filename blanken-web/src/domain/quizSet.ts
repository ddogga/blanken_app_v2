import type { QuizSetOrder } from '../types/quizSet'

export const DEFAULT_QUIZ_SET_ORDER: QuizSetOrder = 'CREATE_AT_DESC'

export const QUIZ_SET_ORDER_OPTIONS: { value: QuizSetOrder; label: string }[] =
  [
    { value: 'CREATE_AT_DESC', label: '최신순' },
    { value: 'LIKE_COUNT_DESC', label: '인기순' },
  ]

export const isQuizSetOrder = (value: string): value is QuizSetOrder =>
  QUIZ_SET_ORDER_OPTIONS.some((option) => option.value === value)
