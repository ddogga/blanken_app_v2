import type { QuizRequest, QuizResponse } from '../types/quiz'
import {
  fromBlankedSentence,
  getAnswers,
  resolveBlanks,
  toBlankedSentence,
  toggleBlank,
  type Blank,
} from './quizSentence'

// 수정 화면에서 편집 중인 퀴즈 하나
export type QuizDraft = {
  key: string // 화면에서 구분하는 값. 새로 추가한 퀴즈는 id가 없어서 따로 둔다
  id: number | null // 서버에 저장된 퀴즈면 id, 새로 추가한 퀴즈면 null
  sentence: string // 빈칸 없는 원래 문장
  blanks: Blank[] // 문장 순서
  translation: string
  hint: string
}

export const createEmptyDraft = (key: string): QuizDraft => ({
  key,
  id: null,
  sentence: '',
  blanks: [],
  translation: '',
  hint: '',
})

export const fromQuizResponse = (
  key: string,
  quiz: QuizResponse,
): QuizDraft => ({
  key,
  id: quiz.id,
  ...fromBlankedSentence(quiz.sentence, quiz.answers),
  translation: quiz.translation,
  hint: quiz.hint ?? '',
})

export const changeSentence = (
  draft: QuizDraft,
  sentence: string,
): QuizDraft => ({
  ...draft,
  sentence,
  blanks: resolveBlanks(sentence, draft.blanks),
})

// 단어를 누르면 빈칸에 넣고, 이미 빈칸이면 뺀다. 여러 개 고를 수 있다
export const toggleBlankAt = (
  draft: QuizDraft,
  tokenIndex: number,
): QuizDraft => ({
  ...draft,
  blanks: toggleBlank(draft.sentence, draft.blanks, tokenIndex),
})

// 정답은 직접 입력하지 않고 고른 단어로 정해진다 (문장 순서)
export const getDraftAnswers = (draft: QuizDraft): string[] =>
  getAnswers(draft.sentence, draft.blanks)

export const QUIZ_SENTENCE_MAX_LENGTH = 500
export const QUIZ_TRANSLATION_MAX_LENGTH = 500
export const QUIZ_HINT_MAX_LENGTH = 200

export type QuizDraftField = 'sentence' | 'translation' | 'hint'
export type QuizDraftErrors = Partial<Record<QuizDraftField, string>>

// 서버 규칙을 미리 검사한다. 정답 규칙 위반은 서버가 500으로 응답하므로 보내기 전에 막아야 한다
export const getDraftErrors = (draft: QuizDraft): QuizDraftErrors => {
  const errors: QuizDraftErrors = {}
  const sentence = draft.sentence.trim()
  const blankedSentence = toBlankedSentence(sentence, draft.blanks)
  const answers = getDraftAnswers(draft)
  // 서버는 {{}}가 들어간 문장을 공백으로 나눠 단어 수를 센다
  const wordCount = blankedSentence.split(/\s+/).filter(Boolean).length

  if (sentence === '') errors.sentence = '문장을 입력해 주세요.'
  else if (/[{}]/.test(sentence)) {
    errors.sentence = '문장에 중괄호({ })는 쓸 수 없어요.'
  } else if (blankedSentence.length > QUIZ_SENTENCE_MAX_LENGTH) {
    errors.sentence = `문장은 ${QUIZ_SENTENCE_MAX_LENGTH}자 이내로 입력해 주세요.`
  } else if (answers.length === 0) {
    errors.sentence = '빈칸으로 만들 단어를 선택해 주세요.'
  } else if (answers.some((answer) => /\s/.test(answer))) {
    errors.sentence = '정답에는 공백이 들어갈 수 없어요.'
  } else if (answers.length >= wordCount) {
    errors.sentence = '빈칸 수는 문장의 단어 수보다 적어야 해요.'
  }

  const translation = draft.translation.trim()
  if (translation === '') errors.translation = '번역 문장을 입력해 주세요.'
  else if (translation.length > QUIZ_TRANSLATION_MAX_LENGTH) {
    errors.translation = `번역 문장은 ${QUIZ_TRANSLATION_MAX_LENGTH}자 이내로 입력해 주세요.`
  }

  if (draft.hint.trim().length > QUIZ_HINT_MAX_LENGTH) {
    errors.hint = `힌트는 ${QUIZ_HINT_MAX_LENGTH}자 이내로 입력해 주세요.`
  }
  return errors
}

// 새로 추가하고 아무것도 입력하지 않은 퀴즈. 에러 문구를 띄우지 않는다
export const isDraftBlank = (draft: QuizDraft): boolean =>
  draft.sentence.trim() === '' &&
  draft.translation.trim() === '' &&
  draft.hint.trim() === ''

export const isDraftValid = (draft: QuizDraft): boolean =>
  Object.keys(getDraftErrors(draft)).length === 0

// 검사를 통과한 퀴즈만 넘긴다. orderIndex는 화면 순서
export const toQuizRequest = (
  draft: QuizDraft,
  orderIndex: number,
): QuizRequest => {
  const hint = draft.hint.trim()
  return {
    id: draft.id,
    sentence: toBlankedSentence(draft.sentence.trim(), draft.blanks),
    answers: getDraftAnswers(draft),
    hint: hint === '' ? null : hint,
    orderIndex,
    translation: draft.translation.trim(),
  }
}

// from 위치의 퀴즈를 to 위치로 옮긴다. 범위를 벗어나면 그대로 둔다
export const moveDraft = (
  drafts: QuizDraft[],
  from: number,
  to: number,
): QuizDraft[] => {
  if (from === to || from < 0 || to < 0) return drafts
  if (from >= drafts.length || to >= drafts.length) return drafts
  const next = [...drafts]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
