import type { ErrorResponse } from '../types/error'
import type { QuizSetFormField } from './quizSetForm'

export type QuizSetCreateFailure =
  // 400 / 409(같은 제목) / 404(카테고리 없음): 모달 안에 표시
  | {
      type: 'invalidInput'
      fieldErrors: Partial<Record<QuizSetFormField, string>>
      // 필드에 묶이지 않은 메시지 (fieldErrors 없는 400, ownerId 오류 등)
      formErrors: string[]
    }
  // 404 U001: 토큰의 유저가 없음 → 다시 로그인
  | { type: 'loginRequired' }
  // 401은 인터셉터가 처리(재발급 또는 토큰 삭제 → 로그인 가드). 403과 그 밖의 실패는 알림
  | { type: 'unknown'; message: string }

const UNKNOWN_ERROR_MESSAGE =
  '퀴즈셋을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.'

const ACCESS_DENIED_MESSAGE = '퀴즈셋을 만들 권한이 없어요.'

const FORM_FIELDS: readonly string[] = ['title', 'description', 'categoryId']
const isFormField = (field: string): field is QuizSetFormField =>
  FORM_FIELDS.includes(field)

export const classifyQuizSetCreateError = (
  status: number | null,
  body: ErrorResponse | null,
): QuizSetCreateFailure => {
  if (status === 400) {
    const fieldErrors: Partial<Record<QuizSetFormField, string>> = {}
    const formErrors: string[] = []
    for (const { field, message } of body?.fieldErrors ?? []) {
      if (isFormField(field)) fieldErrors[field] ??= message
      else formErrors.push(message)
    }
    if (Object.keys(fieldErrors).length === 0 && formErrors.length === 0) {
      formErrors.push(body?.message ?? UNKNOWN_ERROR_MESSAGE)
    }
    return { type: 'invalidInput', fieldErrors, formErrors }
  }
  if (status === 409 && body?.code === 'Q003') {
    return {
      type: 'invalidInput',
      fieldErrors: { title: '같은 제목의 퀴즈셋이 이미 있어요.' },
      formErrors: [],
    }
  }
  if (status === 404 && body?.code === 'G001') {
    return {
      type: 'invalidInput',
      fieldErrors: { categoryId: '선택한 카테고리를 찾을 수 없어요.' },
      formErrors: [],
    }
  }
  if (status === 404 && body?.code === 'U001') return { type: 'loginRequired' }
  // 403 ACCESS_DENIED: 권한 없음 알림
  if (status === 403) return { type: 'unknown', message: ACCESS_DENIED_MESSAGE }
  return { type: 'unknown', message: UNKNOWN_ERROR_MESSAGE }
}
