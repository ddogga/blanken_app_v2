import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { updateQuizSet } from '../api/quizSet'
import { classifyQuizSetUpdateError } from '../domain/quizSetEdit'
import { showAlert } from '../platform/dialog'
import type { UpdateQuizSetRequest } from '../types/quizSet'
import { quizSetDetailKey } from './useQuizSetDetail'

export function useUpdateQuizSet(quizSetId: number) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (request: UpdateQuizSetRequest) =>
      updateQuizSet(quizSetId, request),
    onSuccess: (detail) => {
      // 응답(새 퀴즈의 id 포함)으로 화면을 다시 채운다.
      // 그대로 두면 새 퀴즈가 id 없이 남아, 다음 저장 때 한 번 더 생성된다
      queryClient.setQueryData(quizSetDetailKey(quizSetId), detail)
      void queryClient.invalidateQueries({ queryKey: ['quizSets', 'user'] })
    },
    onError: (error) => {
      const { status, body } = toApiError(error)
      const failure = classifyQuizSetUpdateError(status, body)
      if (failure.type === 'alert') void showAlert(failure.message)
      if (body?.code === 'G001') {
        void queryClient.invalidateQueries({ queryKey: ['categories'] })
      }
    },
  })

  const { status, body } = toApiError(mutation.error)
  const failure = mutation.error
    ? classifyQuizSetUpdateError(status, body)
    : null

  return {
    save: (request: UpdateQuizSetRequest) => {
      // 제출 중에는 다시 보내지 않는다
      if (!mutation.isPending) mutation.mutate(request)
    },
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    // 화면 안에 표시할 에러. 보낸 뒤 입력을 바꿨으면 이전 에러는 보여주지 않는다
    getInputErrors: (current: UpdateQuizSetRequest | null) =>
      failure?.type === 'invalidInput' &&
      JSON.stringify(current) === JSON.stringify(mutation.variables)
        ? failure
        : null,
  }
}
