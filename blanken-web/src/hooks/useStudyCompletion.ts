import { useQuery } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { completeStudySession } from '../api/study'
import { classifyStudyCompleteError } from '../domain/studyCompleteError'
import { showAlert } from '../platform/dialog'

// 자동 재시도 간격. 1초 뒤, 3초 뒤 두 번
const RETRY_DELAYS_MS = [1_000, 3_000]

type Options = {
  // 서버에 결과가 다 저장돼 완주할 수 있을 때만 true
  enabled: boolean
  // 세션을 잃었거나(만료·교체) 서버에 결과가 빠짐 → 학습 시작 API로 다시 받아야 한다
  onResync: () => void
  onSignupRequired: () => void
}

// 학습 완주. enabled가 되면 한 번 요청한다.
// 서버가 멱등(같은 sessionId면 같은 결과)이라 query로 다룬다. 그래서 진행 중에는 다시 보내지 않고,
// 화면에 들어오자마자 완주해야 하는 경우(다 푼 세션의 이어풀기)도 useEffect 없이 처리된다
export function useStudyCompletion(
  quizSetId: number,
  sessionId: string,
  { enabled, onResync, onSignupRequired }: Options,
) {
  const query = useQuery({
    queryKey: ['studyCompletions', quizSetId, sessionId],
    queryFn: async () => {
      try {
        return await completeStudySession(quizSetId, sessionId)
      } catch (error) {
        // 재시도하지 않는 실패의 후속 처리. 요청마다 한 번만 실행되도록 여기서 한다
        const { status, body } = toApiError(error)
        const failure = classifyStudyCompleteError(status, body)
        if (failure.type === 'signupRequired') onSignupRequired()
        if (failure.type === 'sessionLost') {
          void showAlert(failure.message).then(onResync)
        }
        if (failure.type === 'resync') onResync()
        throw error
      }
    },
    enabled,
    // 받은 결과를 다시 받지 않는다. 화면을 떠나면 버린다
    staleTime: Infinity,
    gcTime: 0,
    retry: (failureCount, error) => {
      const { status, body } = toApiError(error)
      return (
        classifyStudyCompleteError(status, body).type === 'retry' &&
        failureCount < RETRY_DELAYS_MS.length
      )
    },
    retryDelay: (failureCount) =>
      RETRY_DELAYS_MS[failureCount] ?? RETRY_DELAYS_MS[0],
  })

  const { status, body } = toApiError(query.error)
  const failure = query.error ? classifyStudyCompleteError(status, body) : null
  return {
    history: query.data,
    isPending: query.isFetching,
    // 자동 재시도까지 실패해 [다시 시도]를 보여줘야 하는지
    isFailed:
      !query.isFetching &&
      (failure?.type === 'retry' || failure?.type === 'unauthorized'),
    retry: () => {
      if (!query.isFetching) void query.refetch()
    },
  }
}
