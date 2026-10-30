import type { ErrorResponse } from '../types/error'
import type {
  QuizSetDetailResponse,
  UpdateQuizSetRequest,
} from '../types/quizSet'
import {
  fromQuizResponse,
  isDraftValid,
  toQuizRequest,
  type QuizDraft,
  type QuizDraftField,
} from './quizDraft'
import {
  canSubmitQuizSetForm,
  fromQuizSetResponse,
  type QuizSetFormField,
  type QuizSetFormValues,
} from './quizSetForm'

// 수정 화면의 처음 상태. 저장된 퀴즈는 id로 key를 만든다
export const toEditState = (detail: QuizSetDetailResponse) => ({
  values: fromQuizSetResponse(detail),
  drafts: [...detail.quizzes]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((quiz) => fromQuizResponse(`saved-${quiz.id}`, quiz)),
})

// 화면 구분용 key를 뺀 내용만 비교한다
const toComparable = (values: QuizSetFormValues, drafts: QuizDraft[]) =>
  JSON.stringify({
    values,
    drafts: drafts.map((draft) => ({ ...draft, key: undefined })),
  })

export const isQuizSetEdited = (
  initial: { values: QuizSetFormValues; drafts: QuizDraft[] },
  current: { values: QuizSetFormValues; drafts: QuizDraft[] },
): boolean =>
  toComparable(initial.values, initial.drafts) !==
  toComparable(current.values, current.drafts)

export const canSaveQuizSet = (
  values: QuizSetFormValues,
  drafts: QuizDraft[],
): boolean => canSubmitQuizSetForm(values) && drafts.every(isDraftValid)

// 저장할 수 없는 상태면 null. 퀴즈는 항상 전체를 화면 순서(orderIndex 0, 1, 2…)로 보낸다
export const toUpdateQuizSetRequest = (
  values: QuizSetFormValues,
  drafts: QuizDraft[],
): UpdateQuizSetRequest | null => {
  if (!canSaveQuizSet(values, drafts) || values.categoryId === null) {
    return null
  }
  const description = values.description.trim()
  return {
    title: values.title.trim(),
    description: description === '' ? null : description,
    visibility: values.visibility,
    categoryId: values.categoryId,
    quizzes: drafts.map((draft, index) => toQuizRequest(draft, index)),
  }
}

export type QuizFieldErrors = Partial<Record<QuizDraftField, string>>

export type QuizSetUpdateFailure =
  // 화면 안에 표시: 400, 409 Q003(제목 중복), 404 G001(카테고리 없음)
  | {
      type: 'invalidInput'
      fieldErrors: Partial<Record<QuizSetFormField, string>>
      quizErrors: Record<number, QuizFieldErrors> // 요청 quizzes의 순번 → 필드 에러
      formErrors: string[] // 필드에 묶이지 않은 메시지
    }
  // 알림: 404 Q001·Q002, 409 C002, 403, 500 등. 401은 인터셉터가 처리
  | { type: 'alert'; message: string }

const UNKNOWN_ERROR_MESSAGE =
  '퀴즈셋을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'

const SET_FIELDS: readonly string[] = ['title', 'description', 'categoryId']
const QUIZ_FIELDS: readonly string[] = [
  'sentence',
  'answers',
  'translation',
  'hint',
]
const isSetField = (field: string): field is QuizSetFormField =>
  SET_FIELDS.includes(field)

// "quizzes[1].sentence" → { index: 1, field: 'sentence' }. 정답 에러는 문장 칸에 표시한다
const parseQuizField = (
  field: string,
): { index: number; field: QuizDraftField } | null => {
  const match = /^quizzes\[(\d+)\]\.(\w+)$/.exec(field)
  if (!match || !QUIZ_FIELDS.includes(match[2])) return null
  const name = match[2] === 'answers' ? 'sentence' : match[2]
  return { index: Number(match[1]), field: name as QuizDraftField }
}

const fieldError = (
  fieldErrors: Partial<Record<QuizSetFormField, string>>,
): QuizSetUpdateFailure => ({
  type: 'invalidInput',
  fieldErrors,
  quizErrors: {},
  formErrors: [],
})

export const classifyQuizSetUpdateError = (
  status: number | null,
  body: ErrorResponse | null,
): QuizSetUpdateFailure => {
  if (status === 400) {
    const fieldErrors: Partial<Record<QuizSetFormField, string>> = {}
    const quizErrors: Record<number, QuizFieldErrors> = {}
    const formErrors: string[] = []
    for (const { field, message } of body?.fieldErrors ?? []) {
      const quizField = parseQuizField(field)
      if (isSetField(field)) fieldErrors[field] ??= message
      else if (quizField) {
        quizErrors[quizField.index] ??= {}
        quizErrors[quizField.index][quizField.field] ??= message
      } else formErrors.push(message)
    }
    const hasAny =
      Object.keys(fieldErrors).length > 0 ||
      Object.keys(quizErrors).length > 0 ||
      formErrors.length > 0
    if (!hasAny) formErrors.push(body?.message ?? UNKNOWN_ERROR_MESSAGE)
    return { type: 'invalidInput', fieldErrors, quizErrors, formErrors }
  }
  // 409·404는 서버 메시지를 그대로 보여준다
  if (status === 409 && body?.code === 'Q003') {
    return fieldError({ title: body.message })
  }
  if (status === 404 && body?.code === 'G001') {
    return fieldError({ categoryId: body.message })
  }
  if ((status === 404 || status === 409 || status === 403) && body) {
    return { type: 'alert', message: body.message }
  }
  return { type: 'alert', message: UNKNOWN_ERROR_MESSAGE }
}
