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

export type QuizResultItem = {
  quizId: number // 세션의 quizzes에 있는 quizId
  result: StudyResult
}

// PATCH /api/quiz-sets/{quizSetId}/study-sessions/{sessionId}/results 요청
export type StudySessionResultsRequest = {
  results: QuizResultItem[] // 1개 이상. 같은 quizId는 서버가 마지막 값으로 덮어쓴다
}

// PATCH /api/quiz-sets/{quizSetId}/study-sessions/{sessionId}/results 응답
export type StudySessionProgressResponse = {
  sessionId: string
  solvedCount: number // 서버에 결과가 저장된 문제 수
  totalCount: number // 세션의 전체 문제 수
  completable: boolean // solvedCount === totalCount. 완주 판단은 이 값으로 한다
  expiresAt: string // ISO-8601(UTC). 저장할 때마다 24시간 연장된다
}
