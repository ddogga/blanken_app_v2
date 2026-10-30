// TODO: 퀴즈 API 명세가 나오면 필드명을 맞춘다
export type QuizResponse = {
  id: number
  sentence: string // 빈칸 자리는 {{}}. 예: "She decided to {{}} the {{}}."
  answers: string[] // 빈칸 순서대로
  translation: string
  hint: string | null
}
