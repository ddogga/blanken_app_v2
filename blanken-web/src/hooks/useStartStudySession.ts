import { useMutation } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { startStudySession } from '../api/study'
import { classifyStudyStartError } from '../domain/studyStartError'
import { showAlert } from '../platform/dialog'
import type { StudySessionResponse } from '../types/study'

type Options = {
  onStarted?: (session: StudySessionResponse) => void
  // 퀴즈셋을 찾을 수 없다는 안내를 닫은 뒤
  onNotFound?: () => void
  onSignupRequired?: () => void
}

// 학습 세션 시작(start) / 진행 중인 세션을 버리고 새로 시작(restart).
// 받은 세션은 onStarted로 넘긴다. 학습 화면은 들어올 때 서버에서 다시 받으므로 캐시에 넣지 않는다
export function useStartStudySession(
  quizSetId: number,
  { onStarted, onNotFound, onSignupRequired }: Options = {},
) {
  const mutation = useMutation({
    mutationFn: (restart: boolean) => startStudySession(quizSetId, restart),
    onSuccess: (session) => {
      onStarted?.(session)
    },
    onError: (error) => {
      const { status, body } = toApiError(error)
      const failure = classifyStudyStartError(status, body)
      if (failure.type === 'alert') void showAlert(failure.message)
      if (failure.type === 'notFound') {
        void showAlert(failure.message).then(() => onNotFound?.())
      }
      if (failure.type === 'signupRequired') onSignupRequired?.()
    },
  })

  // 요청 중에는 다시 보내지 않는다
  const send = (restart: boolean) => {
    if (!mutation.isPending) mutation.mutate(restart)
  }

  return {
    start: () => send(false),
    restart: () => send(true),
    isPending: mutation.isPending,
  }
}
