export type StudyResult = 'CORRECT' | 'GAVE_UP'

// 세션을 시작한 시점의 퀴즈 내용. 학습 중에 퀴즈셋이 수정돼도 바뀌지 않는다
export type QuizSnapshot = {
  quizId: number
  revisionId: number
  sentence: string // 빈칸 자리는 {{}}. 예: "She {{}} up early."
  answers: string[] // answers[i] = i번째 {{}}의 정답
  translation: string | null
  hint: string | null
}

// POST /api/quiz-sets/{quizSetId}/study-sessions 응답
export type StudySessionResponse = {
  sessionId: string // 결과 저장 API에 필요
  resumed: boolean // true = 기존 세션 이어풀기
  startedAt: string // ISO-8601 (UTC)
  expiresAt: string // 이 시각이 지나면 세션 만료
  quizzes: QuizSnapshot[] // 출제 순서대로
  results: Record<string, StudyResult> // 이미 푼 문제. 키는 quizId 문자열 ("12")
  nextQuizIndex: number // 이어서 풀 위치. 다 풀었으면 quizzes.length
}
