import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getMyQuizSets } from '../api/quizSet'
import { DEFAULT_QUIZ_SET_ORDER } from '../domain/quizSet'
import type { QuizSetOrder } from '../types/quizSet'

export function useMyQuizSets() {
  const [order, setOrder] = useState<QuizSetOrder>(DEFAULT_QUIZ_SET_ORDER)

  // 정렬이 바뀌면 queryKey가 바뀌어 서버에 다시 요청한다
  const query = useQuery({
    queryKey: ['quizSets', 'mine', order],
    queryFn: () => getMyQuizSets(order),
    // 정렬을 바꾸는 동안 이전 목록을 유지해 화면이 비지 않게 한다
    placeholderData: keepPreviousData,
  })

  return {
    order,
    setOrder,
    quizSets: query.data?.content ?? [],
    totalCount: query.data?.totalElements ?? 0,
    isLoading: query.isPending,
    isError: query.isError,
  }
}
