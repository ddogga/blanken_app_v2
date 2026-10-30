import { useQuery } from '@tanstack/react-query'
import type { QuizSetDetailResponse } from '../types/quizSet'

export const quizSetDetailKey = (quizSetId: number) =>
  ['quizSets', 'detail', quizSetId] as const

// TODO: 퀴즈셋 상세 조회 API가 생기면 queryFn을 API 호출로 바꾸고 initialData를 지운다.
// 지금은 화면 확인용 샘플 데이터. 저장에 성공하면 응답으로 이 캐시를 덮어쓴다
const createSample = (quizSetId: number): QuizSetDetailResponse => ({
  id: quizSetId,
  ownerId: 1,
  ownerNickname: null,
  title: '비즈니스 이메일 표현',
  description: '업무 메일에서 자주 쓰는 문장 모음',
  visibility: 'PUBLIC',
  likeCount: 0,
  quizCount: 2,
  category: { id: 1, name: '비즈니스' },
  createdAt: '2026-10-29T00:00:00Z',
  updatedAt: '2026-10-29T00:00:00Z',
  quizzes: [
    {
      id: 1,
      quizSetId,
      sentence: 'She decided to {{}} the {{}} until next week.',
      answers: ['postpone', 'meeting'],
      hint: '미루다, 연기하다',
      orderIndex: 0,
      translation: '그녀는 회의를 다음 주로 미루기로 했다.',
    },
    {
      id: 2,
      quizSetId,
      sentence: "I'm {{}} forward to hearing from you.",
      answers: ['looking'],
      hint: null,
      orderIndex: 1,
      translation: '연락 기다리겠습니다.',
    },
  ],
})

// dataUpdatedAt: 캐시가 바뀐 시각. 저장 성공으로 응답이 들어오면 바뀐다
export function useQuizSetDetail(quizSetId: number) {
  const query = useQuery({
    queryKey: quizSetDetailKey(quizSetId),
    queryFn: () => createSample(quizSetId),
    initialData: () => createSample(quizSetId),
    staleTime: Infinity,
  })
  return { detail: query.data, dataUpdatedAt: query.dataUpdatedAt }
}
