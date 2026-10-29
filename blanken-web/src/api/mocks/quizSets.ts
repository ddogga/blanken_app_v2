import type { QuizSetResponse } from '../../types/quizSet'

// 화면 확인용 샘플 데이터. 빈 상태를 보려면 SAMPLE_QUIZ_SETS를 []로 바꾼다
const owner = { ownerId: 1, ownerNickname: '블랭큰' }

export const SAMPLE_QUIZ_SETS: QuizSetResponse[] = [
  {
    id: 1,
    ...owner,
    title: '토익 빈출 동사 30선',
    description: '파트 5에 자주 나오는 동사만 모았습니다.',
    visibility: 'PUBLIC',
    likeCount: 12,
    quizCount: 30,
    category: { id: 1, name: '토익' },
    createdAt: '2026-10-28T09:30:00Z',
    updatedAt: '2026-10-28T09:30:00Z',
  },
  {
    id: 2,
    ...owner,
    title: '일상 회화 필수 표현',
    description: null,
    visibility: 'PUBLIC',
    likeCount: 48,
    quizCount: 15,
    category: { id: 2, name: '회화' },
    createdAt: '2026-10-20T12:00:00Z',
    updatedAt: '2026-10-21T08:00:00Z',
  },
  {
    id: 3,
    ...owner,
    title: '수능 영어 고난도 어휘',
    description:
      '최근 5개년 수능 기출에서 정답률이 낮았던 문장의 핵심 어휘를 빈칸으로 만들었습니다. 문장이 길어서 천천히 풀어 보세요.',
    visibility: 'PRIVATE',
    likeCount: 0,
    quizCount: 42,
    category: { id: 3, name: '수능' },
    createdAt: '2026-10-29T01:10:00Z',
    updatedAt: '2026-10-29T01:10:00Z',
  },
  {
    id: 4,
    ...owner,
    title: '비즈니스 이메일 표현',
    description: '회신, 일정 조율, 사과에 쓰는 표현',
    visibility: 'PUBLIC',
    likeCount: 7,
    quizCount: 0,
    category: { id: 4, name: '비즈니스' },
    createdAt: '2026-10-15T05:00:00Z',
    updatedAt: '2026-10-15T05:00:00Z',
  },
]
