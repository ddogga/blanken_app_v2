import type { ErrorResponse } from '../types/error'

export type StudySaveFailure =
  // 네트워크 오류 / 5xx: 결과를 대기 목록에 남기고 다음 저장 때 함께 보낸다.
  // 401은 인터셉터가 처리(재발급 후 재시도, 실패하면 토큰 삭제 → 로그인 가드)하므로 같이 남겨 둔다
  | { type: 'retry' }
  // 403 ACCESS_DENIED: 가입을 끝내지 않은 유저 → 가입 화면
  | { type: 'signupRequired' }
  // 404 S001(만료) / 409 S002(다른 기기에서 새로 시작): 안내 후 세션을 다시 받는다
  | { type: 'sessionLost'; message: string }
  // 400 S003(세션에 없는 quiz) / C001(요청 형식) 등: 프론트 버그. 기록 후 세션을 다시 받는다
  | { type: 'bug' }

const SESSION_EXPIRED_MESSAGE = '하루가 지나 처음부터 시작합니다'
const SESSION_REPLACED_MESSAGE = '다른 기기에서 새로 시작했습니다'

export const classifyStudySaveError = (
  status: number | null,
  body: ErrorResponse | null,
): StudySaveFailure => {
  if (status === null || status >= 500 || status === 401) {
    return { type: 'retry' }
  }
  if (status === 403) return { type: 'signupRequired' }
  if (status === 404 && body?.code === 'S001') {
    return { type: 'sessionLost', message: SESSION_EXPIRED_MESSAGE }
  }
  if (status === 409 && body?.code === 'S002') {
    return { type: 'sessionLost', message: SESSION_REPLACED_MESSAGE }
  }
  return { type: 'bug' }
}
