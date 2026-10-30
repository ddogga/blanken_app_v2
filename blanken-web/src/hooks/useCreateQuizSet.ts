import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { createQuizSet } from '../api/quizSet'
import { classifyQuizSetCreateError } from '../domain/quizSetCreateError'
import { showAlert } from '../platform/dialog'
import { useAuthStore } from '../stores/authStore'
import type { CreateQuizSetRequest, QuizSetResponse } from '../types/quizSet'

type Options = {
  onSuccess: (quizSet: QuizSetResponse) => void
}

export function useCreateQuizSet({ onSuccess }: Options) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createQuizSet,
    onSuccess: (quizSet) => {
      // 내 퀴즈셋 목록을 다시 받게 한다
      void queryClient.invalidateQueries({ queryKey: ['quizSets', 'user'] })
      onSuccess(quizSet)
    },
    onError: (error) => {
      const { status, body } = toApiError(error)
      const failure = classifyQuizSetCreateError(status, body)
      // 토큰을 지우면 로그인 가드가 /login으로 보낸다
      if (failure.type === 'loginRequired') {
        useAuthStore.getState().clearAccessToken()
      }
      if (failure.type === 'unknown') void showAlert(failure.message)
      // 카테고리가 사라졌으면 목록을 다시 받는다
      if (body?.code === 'G001') {
        void queryClient.invalidateQueries({ queryKey: ['categories'] })
      }
    },
  })

  const { status, body } = toApiError(mutation.error)
  const failure = mutation.error
    ? classifyQuizSetCreateError(status, body)
    : null

  const submit = (request: CreateQuizSetRequest) => {
    // 제출 중에는 다시 보내지 않는다
    if (mutation.isPending) return
    mutation.mutate(request)
  }

  return {
    submit,
    isPending: mutation.isPending,
    fieldErrors: failure?.type === 'invalidInput' ? failure.fieldErrors : {},
    formErrors: failure?.type === 'invalidInput' ? failure.formErrors : [],
    // 제출 중에 reset하면 isPending이 풀려 중복 제출이 가능해지므로 에러 상태일 때만 지운다
    clearServerErrors: () => {
      if (mutation.isError) mutation.reset()
    },
  }
}
