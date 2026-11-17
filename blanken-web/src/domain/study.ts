import type {
  QuizResultItem,
  QuizSnapshot,
  StudySessionResponse,
} from '../types/study'
import { BLANK_PLACEHOLDER } from './quizSentence'

export type StudyPart =
  { type: 'text'; text: string } | { type: 'blank'; index: number } // 몇 번째 빈칸인지 (answers의 인덱스)

// 서버 문장("She {{}} the {{}}.")을 글자/빈칸 조각으로 나눈다
export const parseBlankedSentence = (sentence: string): StudyPart[] => {
  const parts: StudyPart[] = []
  sentence.split(BLANK_PLACEHOLDER).forEach((text, i) => {
    if (i > 0) parts.push({ type: 'blank', index: i - 1 })
    if (text !== '') parts.push({ type: 'text', text })
  })
  return parts
}

// 정답 단어와 정확히 일치해야 한다 (대소문자 구분). 앞뒤 공백만 무시한다
export const isAnswerCorrect = (input: string, answer: string): boolean =>
  input.trim() === answer

// 이어풀기 세션을 이어서 풀지 물어봐야 하는지.
// 한 문제도 안 풀었으면 처음부터 풀면 되고, 다 풀었으면 결과 화면으로 바로 간다
export const needsResumeConfirm = (session: StudySessionResponse): boolean =>
  session.resumed &&
  Object.keys(session.results).length > 0 &&
  session.nextQuizIndex < session.quizzes.length

// 서버에 결과가 다 저장된 세션인지 (다 풀고 완주 전에 나갔다가 이어풀기로 들어온 경우)
export const isSessionComplete = (session: StudySessionResponse): boolean =>
  session.quizzes.every((quiz) => String(quiz.quizId) in session.results)

// 저장 대기 결과에 새 결과를 더한다. 같은 quizId는 마지막 결과 하나만 남긴다
export const mergePendingResults = (
  pending: QuizResultItem[],
  item: QuizResultItem,
): QuizResultItem[] => [
  ...pending.filter((p) => p.quizId !== item.quizId),
  item,
]

// 저장에 성공한 결과를 대기 목록에서 뺀다.
// 요청 중에 같은 quizId의 결과가 새로 쌓였으면 그 결과는 남긴다
export const removeSavedResults = (
  pending: QuizResultItem[],
  saved: QuizResultItem[],
): QuizResultItem[] =>
  pending.filter(
    (p) => !saved.some((s) => s.quizId === p.quizId && s.result === p.result),
  )

// 서버 점수 표시. 소수가 있을 때만 소수점을 보인다 (85.00 → "85", 85.50 → "85.5")
export const formatScore = (score: number): string =>
  String(Number(score.toFixed(2)))

// 완주 결과의 오답(포기한 문제)을 출제 순서대로. revisionId로 찾는다 (quizId가 아님)
export const findWrongQuizzes = (
  quizzes: QuizSnapshot[],
  wrongRevisionIds: number[],
): QuizSnapshot[] =>
  quizzes.filter((quiz) => wrongRevisionIds.includes(quiz.revisionId))
