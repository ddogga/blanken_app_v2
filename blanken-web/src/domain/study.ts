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

export type QuizResult = 'correct' | 'wrong'

export const countCorrect = (results: QuizResult[]): number =>
  results.filter((result) => result === 'correct').length
