import { useState } from 'react'
import {
  EMPTY_AGREEMENTS,
  canSubmitSignup,
  getNicknameLength,
  isAllAgreed,
  setAllAgreements,
  toSignupRequest,
  validateNickname,
  type AgreementKey,
  type Agreements,
} from '../domain/signup'
import type { SignupRequest } from '../types/auth'

export function useSignupForm() {
  const [nickname, setNickname] = useState('')
  const [agreements, setAgreements] = useState<Agreements>(EMPTY_AGREEMENTS)

  const allAgreed = isAllAgreed(agreements)

  const toggleAgreement = (key: AgreementKey) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAll = () => {
    setAgreements(setAllAgreements(!allAgreed))
  }

  const buildRequest = (): SignupRequest =>
    toSignupRequest(nickname, agreements)

  return {
    nickname,
    setNickname,
    nicknameLength: getNicknameLength(nickname),
    // 아무것도 입력하지 않은 처음 상태에서는 에러를 보여주지 않는다
    nicknameError: nickname === '' ? null : validateNickname(nickname),
    agreements,
    allAgreed,
    toggleAgreement,
    toggleAll,
    canSubmit: canSubmitSignup(nickname, agreements),
    buildRequest,
  }
}
