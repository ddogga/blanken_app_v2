export type FieldError = {
  field: string
  message: string
}

// 서버 공통 에러 응답 본문
export type ErrorResponse = {
  code: string
  message: string
  fieldErrors?: FieldError[]
}
