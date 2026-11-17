import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { toApiError } from '../api/error'
import { saveStudyResults } from '../api/study'
import { mergePendingResults, removeSavedResults } from '../domain/study'
import { classifyStudySaveError } from '../domain/studySaveError'
import { showAlert } from '../platform/dialog'
import type {
  QuizResultItem,
  StudySessionProgressResponse,
} from '../types/study'

type Options = {
  // 시작 시점에 서버에 결과가 다 저장돼 있었는지
  initialCompletable: boolean
  // 저장 성공. pendingEmpty는 보낼 결과가 더 남아 있지 않은지
  onSaved?: (
    progress: StudySessionProgressResponse,
    pendingEmpty: boolean,
  ) => void
  // 세션을 잃었거나(만료·교체) 상태가 어긋남 → 학습 시작 API로 다시 받아야 한다
  onResync: () => void
  onSignupRequired: () => void
}

// 푼 문제 결과를 서버 세션에 저장한다.
// - 요청은 한 번에 하나만 보낸다. 요청 중에 생긴 결과는 대기 목록(pending)에 쌓았다가 끝나면 묶어서 보낸다
// - 네트워크 오류·5xx로 실패한 결과는 대기 목록에 남겨 다음 저장 때 함께 보낸다
// - 대기 목록은 메모리에만 둔다. 사라져도 이어풀기 때 그 문제를 다시 풀면 된다
export function useStudyResultSaver(
  quizSetId: number,
  sessionId: string,
  { initialCompletable, onSaved, onResync, onSignupRequired }: Options,
) {
  // 요청 콜백 안에서도 최신 값을 읽어야 해서 state가 아닌 ref에 둔다
  const pendingRef = useRef<QuizResultItem[]>([])
  const inFlightRef = useRef(false)
  // 세션을 잃은 뒤에는 더 보내지 않는다
  const stoppedRef = useRef(false)

  const [completable, setCompletable] = useState(initialCompletable)
  const [isSaving, setIsSaving] = useState(false)
  // 마지막 저장이 실패해 보내지 못한 결과가 남아 있는지
  const [isFailed, setIsFailed] = useState(false)

  const mutation = useMutation({
    mutationFn: (results: QuizResultItem[]) =>
      saveStudyResults(quizSetId, sessionId, results),
  })

  const flush = () => {
    if (inFlightRef.current || stoppedRef.current) return
    const batch = pendingRef.current
    if (batch.length === 0) return

    inFlightRef.current = true
    setIsSaving(true)
    setIsFailed(false)
    mutation.mutate(batch, {
      onSuccess: (progress) => {
        inFlightRef.current = false
        pendingRef.current = removeSavedResults(pendingRef.current, batch)
        setCompletable(progress.completable)
        const pendingEmpty = pendingRef.current.length === 0
        if (pendingEmpty) setIsSaving(false)
        onSaved?.(progress, pendingEmpty)
        // 요청 중에 쌓인 결과를 이어서 보낸다
        flush()
      },
      onError: (error) => {
        inFlightRef.current = false
        setIsSaving(false)
        const { status, body } = toApiError(error)
        const failure = classifyStudySaveError(status, body)
        if (failure.type === 'retry') {
          setIsFailed(true)
          return
        }
        stoppedRef.current = true
        if (failure.type === 'signupRequired') onSignupRequired()
        if (failure.type === 'sessionLost') {
          void showAlert(failure.message).then(onResync)
        }
        if (failure.type === 'bug') {
          console.error('학습 결과 저장 요청 오류', status, body, batch)
          onResync()
        }
      },
    })
  }

  return {
    // 결과가 정해진 문제 하나를 저장한다. 응답을 기다리지 않는다
    save: (item: QuizResultItem) => {
      if (stoppedRef.current) return
      pendingRef.current = mergePendingResults(pendingRef.current, item)
      flush()
    },
    // 실패해 남아 있는 결과를 다시 보낸다
    retry: flush,
    // 서버 기준 완주 가능 여부
    completable,
    isSaving,
    isFailed,
  }
}
