import type { Visibility } from '../types/quizSet'

export const QUIZ_SET_TITLE_MAX_LENGTH = 100
export const QUIZ_SET_DESCRIPTION_MAX_LENGTH = 500

export type QuizSetFormValues = {
  title: string
  description: string
  visibility: Visibility
  categoryId: number | null
}

export const EMPTY_QUIZ_SET_FORM: QuizSetFormValues = {
  title: '',
  description: '',
  visibility: 'PUBLIC',
  categoryId: null,
}

// 앞뒤 공백을 뺀 길이 기준
export const getTrimmedLength = (value: string): number => value.trim().length

export const validateQuizSetTitle = (title: string): string | null => {
  const length = getTrimmedLength(title)
  if (length === 0) return '제목을 입력해 주세요.'
  if (length > QUIZ_SET_TITLE_MAX_LENGTH) {
    return `제목은 ${QUIZ_SET_TITLE_MAX_LENGTH}자 이내로 입력해 주세요.`
  }
  return null
}

// 설명은 선택 입력
export const validateQuizSetDescription = (
  description: string,
): string | null =>
  getTrimmedLength(description) > QUIZ_SET_DESCRIPTION_MAX_LENGTH
    ? `설명은 ${QUIZ_SET_DESCRIPTION_MAX_LENGTH}자 이내로 입력해 주세요.`
    : null

export const canSubmitQuizSetForm = (values: QuizSetFormValues): boolean =>
  validateQuizSetTitle(values.title) === null &&
  validateQuizSetDescription(values.description) === null &&
  values.categoryId !== null
