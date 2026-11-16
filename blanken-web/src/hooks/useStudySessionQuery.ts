import { useQuery } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { startStudySession } from '../api/study'
import { classifyStudyStartError } from '../domain/studyStartError'

export const studySessionKey = (quizSetId: number) =>
  ['studySessions', quizSetId] as const

// 학습 화면이 쓰는 세션.
// 보통은 퀴즈셋 화면에서 시작 요청을 보내며 캐시에 넣어 두므로 여기서는 요청하지 않는다.
// 새로고침이나 주소로 바로 들어와 캐시가 비어 있을 때만 시작 요청을 보내고,
// 진행 중인 세션이 있으면 묻지 않고 이어서 푼다.
// (restart 없는 시작 요청은 진행 중인 세션을 그대로 돌려주므로 여러 번 보내도 안전하다)
export function useStudySessionQuery(quizSetId: number) {
  const query = useQuery({
    queryKey: studySessionKey(quizSetId),
    queryFn: () => startStudySession(quizSetId),
    // 받은 세션을 다시 받지 않는다. 다시 받으면 푸는 중인 화면이 처음 상태로 덮인다
    staleTime: Infinity,
    // 404·400처럼 다시 보내도 같은 결과인 응답은 재시도하지 않는다
    retry: (failureCount, error) => {
      const { status } = toApiError(error)
      return (status === null || status >= 500) && failureCount < 2
    },
  })

  const { status, body } = toApiError(query.error)
  return {
    session: query.data,
    isLoading: query.isPending,
    failure: query.error ? classifyStudyStartError(status, body) : null,
  }
}
