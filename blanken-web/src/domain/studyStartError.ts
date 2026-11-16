import type { ErrorResponse } from '../types/error'

export type StudyStartFailure =
  // 404 Q001: 퀴즈셋이 없거나 남의 비공개 → 안내 후 이전 화면
  | { type: 'notFound'; message: string }
  // 403 ACCESS_DENIED: 가입을 끝내지 않은 유저 → 가입 화면
  | { type: 'signupRequired' }
  // 401: 인터셉터가 처리(재발급 또는 토큰 삭제 → 로그인 가드). 따로 안내하지 않는다
  | { type: 'unauthorized' }
  // 400 Q007(퀴즈 5개 미만), 400 C001(요청 버그), 그 밖의 실패 → 안내만
  | { type: 'alert'; message: string }

const NOT_FOUND_MESSAGE = '퀴즈셋을 찾을 수 없습니다'
const NOT_ENOUGH_QUIZZES_MESSAGE =
  '문제가 5개 이상인 퀴즈셋만 학습할 수 있습니다'
const UNKNOWN_ERROR_MESSAGE =
  '학습을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.'

export const classifyStudyStartError = (
  status: number | null,
  body: ErrorResponse | null,
): StudyStartFailure => {
  if (status === 401) return { type: 'unauthorized' }
  if (status === 403) return { type: 'signupRequired' }
  if (status === 404) return { type: 'notFound', message: NOT_FOUND_MESSAGE }
  if (status === 400 && body?.code === 'Q007') {
    return { type: 'alert', message: NOT_ENOUGH_QUIZZES_MESSAGE }
  }
  return { type: 'alert', message: UNKNOWN_ERROR_MESSAGE }
}
