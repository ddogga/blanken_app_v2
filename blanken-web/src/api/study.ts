import type { StudySessionResponse } from '../types/study'
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
