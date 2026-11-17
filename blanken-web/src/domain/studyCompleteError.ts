import type { ErrorResponse } from '../types/error'

export type StudyCompleteFailure =
  // 네트워크 오류·timeout / 5xx / 409 C002(동시에 들어온 완주 요청과 충돌): 자동 재시도.
  // 재시도까지 실패하면 [다시 시도]를 보여준다
  | { type: 'retry' }
  // 401: 인터셉터가 처리(재발급 후 재시도, 실패하면 토큰 삭제 → 로그인 가드). [다시 시도]만 보여준다
  | { type: 'unauthorized' }
  // 403 ACCESS_DENIED: 가입을 끝내지 않은 유저 → 가입 화면
  | { type: 'signupRequired' }
  // 404 S001(만료) / 409 S002(다른 기기에서 새로 시작): 안내 후 세션을 다시 받는다
  | { type: 'sessionLost'; message: string }
  // 409 S004(서버에 결과가 없는 문제가 남음) 등: 서버 상태로 다시 맞춰 남은 문제를 이어서 푼다
  | { type: 'resync' }

const SESSION_EXPIRED_MESSAGE = '학습 세션이 만료되어 결과를 저장하지 못했어요'
const SESSION_REPLACED_MESSAGE = '다른 기기에서 학습이 다시 시작됐어요'

export const classifyStudyCompleteError = (
  status: number | null,
  body: ErrorResponse | null,
): StudyCompleteFailure => {
  if (status === null || status >= 500) return { type: 'retry' }
  if (status === 409 && body?.code === 'C002') return { type: 'retry' }
  if (status === 401) return { type: 'unauthorized' }
  if (status === 403) return { type: 'signupRequired' }
  if (status === 404 && body?.code === 'S001') {
    return { type: 'sessionLost', message: SESSION_EXPIRED_MESSAGE }
  }
  if (status === 409 && body?.code === 'S002') {
    return { type: 'sessionLost', message: SESSION_REPLACED_MESSAGE }
  }
  return { type: 'resync' }
}
