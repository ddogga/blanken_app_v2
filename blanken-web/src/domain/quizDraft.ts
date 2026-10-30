import type { QuizResponse } from '../types/quiz'
import {
  fromBlankedSentence,
  getAnswers,
  resolveBlanks,
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

export const getDraftError = (draft: QuizDraft): string | null => {
  if (draft.sentence.trim() === '') return '문장을 입력해 주세요.'
  if (draft.blanks.length === 0) return '빈칸으로 만들 단어를 선택해 주세요.'
  if (draft.translation.trim() === '') return '번역 문장을 입력해 주세요.'
  return null
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
