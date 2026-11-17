import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { startStudySession } from '../api/study'
import { classifyStudyStartError } from '../domain/studyStartError'
import type { StudySessionResponse } from '../types/study'

const studySessionKey = (quizSetId: number) =>
  ['studySessions', quizSetId] as const

// 학습 화면이 쓰는 세션. 화면에 들어올 때마다 학습 시작 API(restart 없이)로 서버의 마지막 상태를 받는다.
// 진행 중인 세션이 있으면 묻지 않고 이어서 푼다.
// (restart 없는 시작 요청은 진행 중인 세션을 그대로 돌려주므로 여러 번 보내도 안전하다)
export function useStudySessionQuery(quizSetId: number) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: studySessionKey(quizSetId),
    queryFn: () => startStudySession(quizSetId),
    // 화면에 있는 동안은 다시 받지 않는다. 다시 받으면 푸는 중인 화면이 처음 상태로 덮인다
    staleTime: Infinity,
    // 화면을 떠나면 바로 버린다. 다시 들어오면 서버에서 새로 받는다
    gcTime: 0,
    // 404·400처럼 다시 보내도 같은 결과인 응답은 재시도하지 않는다
    retry: (failureCount, error) => {
      const { status } = toApiError(error)
      return (status === null || status >= 500) && failureCount < 2
    },
  })

  const { status, body } = toApiError(query.error)
  return {
    session: query.data,
    // 세션을 받은 시각. 같은 sessionId를 다시 받아도 바뀌므로 화면 초기화 key로 쓴다
    receivedAt: query.dataUpdatedAt,
    isLoading: query.isPending || query.isRefetching,
    failure: query.error ? classifyStudyStartError(status, body) : null,
    // 서버 상태로 다시 맞춘다 (세션 만료·교체, 요청 버그 등)
    resync: () => void query.refetch(),
    // '다시 학습하기'로 새로 받은 세션으로 바꾼다
    replaceSession: (session: StudySessionResponse) =>
      queryClient.setQueryData(studySessionKey(quizSetId), session),
  }
}
