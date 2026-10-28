export const DEFAULT_LOGIN_ERROR_MESSAGE = '로그인에 실패했습니다.'

const LOGIN_ERROR_MESSAGES = new Map<string, string>([
  ['access_denied', '로그인이 취소되었습니다.'],
  ['withdrawn_user', '탈퇴한 계정입니다.'], // TODO: 탈퇴한 유저 소프트 삭제, 24시간 동안 기록 유지 후 완전히 삭제 로직을 도입시 안내 문구 수정
  ['authorization_request_not_found', '다시 시도해 주세요.'],
  ['login_failed', DEFAULT_LOGIN_ERROR_MESSAGE],
])

// 서버가 /login?error={code}로 보낸 코드를 안내 문구로 바꾼다. 모르는 코드는 공통 문구
export const getLoginErrorMessage = (code: string): string =>
  LOGIN_ERROR_MESSAGES.get(code) ?? DEFAULT_LOGIN_ERROR_MESSAGE
