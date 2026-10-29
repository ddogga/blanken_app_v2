import { useMutation } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { signup } from '../api/user'
import { classifySignupError } from '../domain/signupError'
import { showAlert } from '../platform/dialog'
import { useAuthStore } from '../stores/authStore'
import type { SignupRequest } from '../types/auth'

type Options = {
  onSuccess: () => void
  onAlreadySignedUp: () => void
  onLoginRequired: () => void
}

export function useSignup({
  onSuccess,
  onAlreadySignedUp,
  onLoginRequired,
}: Options) {
  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (token) => {
      // GUEST 토큰을 버리고 USER 토큰으로 교체
      useAuthStore.getState().setAccessToken(token.accessToken)
      onSuccess()
    },
    onError: (error) => {
      const { status, body } = toApiError(error)
      const failure = classifySignupError(status, body)
      if (failure.type === 'alreadySignedUp') onAlreadySignedUp()
      if (failure.type === 'loginRequired') {
        useAuthStore.getState().clearAccessToken()
        onLoginRequired()
      }
      if (failure.type === 'unknown') void showAlert(failure.message)
    },
  })

  // 400 응답이면 화면에 표시할 에러를 꺼낸다
  const { status, body } = toApiError(mutation.error)
  const failure = mutation.error ? classifySignupError(status, body) : null
  const fieldErrors =
    failure?.type === 'invalidInput' ? failure.fieldErrors : {}
  const nicknameServerError = fieldErrors.nickname ?? null
  // 닉네임 외 필드 에러, 또는 필드 정보 없는 400 메시지
  const otherErrors =
    failure?.type === 'invalidInput'
      ? Object.keys(fieldErrors).length === 0
        ? [failure.message]
        : Object.entries(fieldErrors)
            .filter(([field]) => field !== 'nickname')
            .map(([, message]) => message)
      : []

  const submit = (request: SignupRequest) => {
    // 같은 토큰으로 두 번 제출하지 않는다
    if (mutation.isPending) return
    mutation.mutate(request)
  }

  return {
    submit,
    isPending: mutation.isPending,
    nicknameServerError,
    otherErrors,
    // 제출 중에 reset하면 isPending이 풀려 중복 제출이 가능해지므로 에러 상태일 때만 지운다
    clearServerErrors: () => {
      if (mutation.isError) mutation.reset()
    },
  }
}
