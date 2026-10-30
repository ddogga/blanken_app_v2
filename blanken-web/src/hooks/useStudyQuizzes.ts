import type { QuizResponse } from '../types/quiz'

// TODO: 학습 API가 생기면 useQuery로 교체한다. 지금은 화면 확인용 샘플 데이터
const SAMPLE_QUIZZES: QuizResponse[] = [
  {
    id: 1,
    quizSetId: 1,
    sentence: 'She decided to {{}} the {{}} until next week.',
    answers: ['postpone', 'meeting'],
    hint: '미루다, 연기하다',
    orderIndex: 0,
    translation: '그녀는 회의를 다음 주로 미루기로 했다.',
  },
  {
    id: 2,
    quizSetId: 1,
    sentence: "I'm {{}} forward to hearing from you.",
    answers: ['looking'],
    hint: null,
    orderIndex: 1,
    translation: '연락 기다리겠습니다.',
  },
  {
    id: 3,
    quizSetId: 1,
    sentence: 'Please {{}} the attached document before {{}}.',
    answers: ['review', 'Friday'],
    hint: '검토하다',
    orderIndex: 2,
    translation: '금요일 전에 첨부 문서를 검토해 주세요.',
  },
]

export function useStudyQuizzes(quizSetId: number) {
  return {
    quizzes: SAMPLE_QUIZZES.map((quiz) => ({ ...quiz, quizSetId })),
  }
}
