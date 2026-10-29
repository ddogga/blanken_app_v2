import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getUserQuizSets } from '../api/quizSet'
import {
  DEFAULT_QUIZ_SET_ORDER,
  QUIZ_SET_PAGE_SIZE,
  getNextQuizSetPage,
  mergeQuizSetPages,
} from '../domain/quizSet'
import type { QuizSetOrder } from '../types/quizSet'
import { useMyUserId } from './useMyUserId'

export function useMyQuizSets() {
  const userId = useMyUserId()
  const [order, setOrder] = useState<QuizSetOrder>(DEFAULT_QUIZ_SET_ORDER)

  // 정렬이 바뀌면 queryKey가 바뀌어 첫 페이지부터 다시 요청한다
  const query = useInfiniteQuery({
    queryKey: ['quizSets', 'user', userId, order],
    queryFn: ({ pageParam }) =>
      getUserQuizSets({
        // enabled 조건 때문에 userId가 null이면 호출되지 않는다
        userId: userId ?? 0,
        order,
        page: pageParam,
        size: QUIZ_SET_PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: getNextQuizSetPage,
    enabled: userId !== null,
    // 정렬을 바꾸는 동안 이전 목록을 유지해 화면이 비지 않게 한다
    placeholderData: keepPreviousData,
  })

  const pages = query.data?.pages ?? []

  return {
    order,
    setOrder,
    quizSets: mergeQuizSetPages(pages),
    totalCount: pages[0]?.totalElements ?? 0,
    isLoading: query.isPending,
    isError: query.isError && !query.isFetchNextPageError,
    retry: () => void query.refetch(),
    hasMore: query.hasNextPage,
    loadMore: () => {
      if (!query.isFetchingNextPage) void query.fetchNextPage()
    },
    isLoadingMore: query.isFetchingNextPage,
    isLoadMoreError: query.isFetchNextPageError,
  }
}
