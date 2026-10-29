import type { ErrorResponse } from '../types/error'

export type SignupFailure =
  // 400: 입력값 오류. 필드별 메시지와 필드에 묶이지 않은 메시지
  | {
      type: 'invalidInput'
      fieldErrors: Record<string, string>
      message: string
    }
  // 409(가입 완료) / 403(USER 토큰으로 호출): 메인으로
  | { type: 'alreadySignedUp' }
  // 404(회원 없음) / 401(토큰 무효·없음, 재발급 실패): 로그인 화면으로
  | { type: 'loginRequired' }
  | { type: 'unknown'; message: string }

const UNKNOWN_ERROR_MESSAGE =
  '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.'

export const classifySignupError = (
  status: number | null,
  body: ErrorResponse | null,
): SignupFailure => {
  if (status === 400) {
    const fieldErrors: Record<string, string> = {}
    for (const { field, message } of body?.fieldErrors ?? []) {
      fieldErrors[field] ??= message
    }
    return {
      type: 'invalidInput',
      fieldErrors,
      message: body?.message ?? UNKNOWN_ERROR_MESSAGE,
    }
  }
  if (status === 409 || status === 403) return { type: 'alreadySignedUp' }
  if (status === 404 || status === 401) return { type: 'loginRequired' }
  return { type: 'unknown', message: UNKNOWN_ERROR_MESSAGE }
}
