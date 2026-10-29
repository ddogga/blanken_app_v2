import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../api/category'

// 이 훅을 쓰는 화면(퀴즈셋 생성 모달)이 열릴 때 조회한다.
// 한 번 받은 목록은 거의 바뀌지 않으므로 앱을 쓰는 동안 다시 받지 않는다.
export function useCategories() {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity,
  })

  // 실패한 뒤 셀렉트를 다시 누르면 재조회
  const retryIfFailed = () => {
    if (query.isError && !query.isFetching) void query.refetch()
  }

  return {
    categories: query.data ?? [],
    isLoading: query.isFetching && !query.data,
    isError: query.isError && !query.isFetching,
    retryIfFailed,
  }
}
