export type QuizResponse = {
  id: number
  quizSetId: number
  sentence: string // 빈칸 자리는 {{}}. 예: "She decided to {{}} the {{}}."
  answers: string[] // 빈칸 순서대로
  hint: string | null
  orderIndex: number // 0부터
  translation: string
}

// PUT /api/quiz-sets/{id}의 quizzes 항목
export type QuizRequest = {
  id: number | null // null이면 새 퀴즈, 값이 있으면 기존 퀴즈 수정
  sentence: string
  answers: string[]
  hint: string | null
  orderIndex: number // 화면 순서대로 0, 1, 2… (중복·빈 번호 금지)
  translation: string
}
