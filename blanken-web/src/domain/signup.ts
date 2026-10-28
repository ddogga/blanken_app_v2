import type { SignupRequest } from '../types/auth'

export const NICKNAME_MIN_LENGTH = 2
export const NICKNAME_MAX_LENGTH = 20

export type Agreements = Omit<SignupRequest, 'nickname'>
export type AgreementKey = keyof Agreements

export const EMPTY_AGREEMENTS: Agreements = {
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
}

// 앞뒤 공백을 뺀 길이 기준. String.length는 Java와 같은 UTF-16 단위로 센다.
export const getNicknameLength = (nickname: string): number =>
  nickname.trim().length

export const validateNickname = (nickname: string): string | null => {
  const length = getNicknameLength(nickname)
  if (length < NICKNAME_MIN_LENGTH || length > NICKNAME_MAX_LENGTH) {
    return `닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자로 입력해 주세요.`
  }
  return null
}

export const hasRequiredAgreements = (agreements: Agreements): boolean =>
  agreements.agreeTerms && agreements.agreePrivacy

export const isAllAgreed = (agreements: Agreements): boolean =>
  Object.values(agreements).every(Boolean)

export const setAllAgreements = (value: boolean): Agreements => ({
  agreeTerms: value,
  agreePrivacy: value,
  agreeMarketing: value,
})

export const canSubmitSignup = (
  nickname: string,
  agreements: Agreements,
): boolean =>
  validateNickname(nickname) === null && hasRequiredAgreements(agreements)

export const toSignupRequest = (
  nickname: string,
  agreements: Agreements,
): SignupRequest => ({
  nickname: nickname.trim(),
  ...agreements,
})
