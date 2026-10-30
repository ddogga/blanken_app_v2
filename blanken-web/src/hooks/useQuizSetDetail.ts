import { useQuery } from '@tanstack/react-query'
import { toApiError } from '../api/error'
import { getQuizSet } from '../api/quizSet'

export const quizSetDetailKey = (quizSetId: number) =>
  ['quizSets', 'detail', quizSetId] as const

const LOAD_ERROR_MESSAGE = '퀴즈셋을 불러오지 못했어요.'

// 수정 화면용 퀴즈셋 상세.
// 편집 중에 다시 받아오면 입력하던 내용이 응답으로 덮이므로, 화면에 들어올 때 한 번만 받는다.
// (창 포커스·재연결 시 다시 받지 않고, 화면을 떠나면 캐시를 버려 다음에 들어올 때 새로 받는다)
// 저장에 성공하면 useUpdateQuizSet이 응답으로 이 캐시를 덮어쓴다.
export function useQuizSetDetail(quizSetId: number) {
  const query = useQuery({
    queryKey: quizSetDetailKey(quizSetId),
    queryFn: () => getQuizSet(quizSetId),
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 404·403처럼 다시 보내도 같은 결과인 응답은 재시도하지 않는다
    retry: (failureCount, error) => {
      const { status } = toApiError(error)
      return (status === null || status >= 500) && failureCount < 2
    },
  })

  const { status, body } = toApiError(query.error)
  // 404 Q001(없음)·403 Q005(남의 비공개)는 서버 메시지를 그대로 보여준다
  const errorMessage =
    (status === 404 || status === 403) && body
      ? body.message
      : LOAD_ERROR_MESSAGE

  return {
    detail: query.data,
    // 캐시가 바뀐 시각. 처음 받거나 저장 응답으로 덮이면 바뀐다
    dataUpdatedAt: query.dataUpdatedAt,
    isLoading: query.isPending,
    isError: query.isError,
    // 다시 시도해도 결과가 같은 에러인지 (재시도 버튼을 숨길지)
    isPermanentError: status === 404 || status === 403,
    errorMessage,
    retry: () => void query.refetch(),
  }
}
