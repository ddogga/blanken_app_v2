import type { QuizResponse } from '../types/quiz'
import type { QuizSetResponse } from '../types/quizSet'

// TODO: 퀴즈셋 상세·퀴즈 목록 조회 API가 생기면 useQuery로 교체한다. 지금은 화면 확인용 샘플 데이터
const SAMPLE_QUIZZES: QuizResponse[] = [
  {
    id: 1,
    sentence: 'She decided to {{}} the {{}} until next week.',
    answers: ['postpone', 'meeting'],
    translation: '그녀는 회의를 다음 주로 미루기로 했다.',
    hint: '미루다, 연기하다',
  },
  {
    id: 2,
    sentence: "I'm {{}} forward to hearing from you.",
    answers: ['looking'],
    translation: '연락 기다리겠습니다.',
    hint: null,
  },
]

export function useQuizSetDetail(quizSetId: number) {
  const quizSet: QuizSetResponse = {
    id: quizSetId,
    ownerId: 1,
    ownerNickname: null,
    title: '비즈니스 이메일 표현',
    description: '업무 메일에서 자주 쓰는 문장 모음',
    visibility: 'PUBLIC',
    likeCount: 0,
    quizCount: SAMPLE_QUIZZES.length,
    category: { id: 1, name: '비즈니스' },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  }
  return { quizSet, quizzes: SAMPLE_QUIZZES }
}
