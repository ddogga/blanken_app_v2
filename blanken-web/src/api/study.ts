import type {
  StudyHistoryResponse,
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

// 완주 요청이 응답 없이 끝나지 않는 일이 없도록 이 요청에만 거는 제한 시간
const COMPLETE_TIMEOUT_MS = 10_000

// POST /api/quiz-sets/{quizSetId}/study-sessions/{sessionId}/complete — 학습 완주 (body 없음)
// 서버가 세션으로 점수를 계산해 히스토리에 저장하고 세션을 지운다.
// 멱등: 같은 sessionId로 다시 불러도 같은 결과(200)를 돌려준다
export const completeStudySession = async (
  quizSetId: number,
  sessionId: string,
): Promise<StudyHistoryResponse> => {
  const res = await apiClient.post<StudyHistoryResponse>(
    `/api/quiz-sets/${quizSetId}/study-sessions/${sessionId}/complete`,
    null,
    { timeout: COMPLETE_TIMEOUT_MS },
  )
  return res.data
}
