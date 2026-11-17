import type {
  StudySessionProgressResponse,
  StudySessionResponse,
  QuizResultItem,
} from '../types/study'
import { apiClient } from './client'

// POST /api/quiz-sets/{quizSetId}/study-sessions — 학습 세션 시작
// 진행 중인 세션이 있으면 그 세션(200, resumed: true), 없으면 새 세션(201)을 돌려준다.
// restart=true면 진행 중인 세션을 버리고 새로 만든다
export const startStudySession = async (
  quizSetId: number,
  restart = false,
): Promise<StudySessionResponse> => {
  const res = await apiClient.post<StudySessionResponse>(
    `/api/quiz-sets/${quizSetId}/study-sessions`,
    null,
    { params: restart ? { restart: true } : undefined },
  )
  return res.data
}

// PATCH /api/quiz-sets/{quizSetId}/study-sessions/{sessionId}/results — 푼 문제 결과 저장
// 여러 개를 한 번에 보내도 되고, 하나라도 잘못된 quizId가 있으면 전체가 저장되지 않는다
export const saveStudyResults = async (
  quizSetId: number,
  sessionId: string,
  results: QuizResultItem[],
): Promise<StudySessionProgressResponse> => {
  const res = await apiClient.patch<StudySessionProgressResponse>(
    `/api/quiz-sets/${quizSetId}/study-sessions/${sessionId}/results`,
    { results },
  )
  return res.data
}
