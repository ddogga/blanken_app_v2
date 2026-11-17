import { useRef, useState } from 'react'
import { isAnswerCorrect, isSessionComplete } from '../domain/study'
import type {
  QuizSnapshot,
  StudyResult,
  StudySessionResponse,
} from '../types/study'
import { useStudyCompletion } from './useStudyCompletion'
import { useStudyResultSaver } from './useStudyResultSaver'

// 지금 풀고 있는 문제 하나의 상태
type QuizState = {
  inputs: string[] // 빈칸별 입력값
  wrong: boolean[] // 빈칸별로 틀린 답을 제출(Enter)했는지
  gaveUp: boolean
  showHint: boolean
}

const createQuizState = (quiz: QuizSnapshot | undefined): QuizState => ({
  inputs: quiz?.answers.map(() => '') ?? [],
  wrong: quiz?.answers.map(() => false) ?? [],
  gaveUp: false,
  showHint: false,
})

// 퀴즈 풀이 진행. 채점은 클라이언트에서 실시간으로 한다.
// 틀려도 무제한 다시 입력할 수 있고, 포기해야만 오답으로 기록한다.
// 서버 세션의 진행 위치(nextQuizIndex)와 이미 푼 결과(results)에서 이어서 시작한다.
// 처음 마운트될 때의 세션만 쓰므로, 세션이 바뀌면 key로 다시 마운트해야 한다.
// 진행 상황의 기준은 서버다. 여기 상태는 화면을 그리기 위한 사본이고,
// 문제의 결과가 정해지는 순간(정답·포기) 서버에 저장한다
export function useStudySession(
  quizSetId: number,
  session: StudySessionResponse,
  {
    onResync,
    onSignupRequired,
  }: {
    // 세션을 잃었거나 서버와 상태가 어긋남 → 학습 시작 API로 세션을 다시 받아야 한다
    onResync: () => void
    onSignupRequired: () => void
  },
) {
  const { quizzes } = session
  const [index, setIndex] = useState(session.nextQuizIndex)
  // 키는 quizId 문자열. 서버 응답 results와 같은 모양. 결과가 정해지면 응답을 기다리지 않고 바로 반영한다
  const [results, setResults] = useState<Record<string, StudyResult>>(
    session.results,
  )
  // 저장 응답 콜백에서 최신 결과 수를 읽기 위한 사본
  const resultsRef = useRef(session.results)
  // 완주 API를 불러도 되는지. 완주 판단은 서버 기준이다.
  // 다 푼 세션을 이어풀기로 받았으면 처음부터 true (화면에 들어오자마자 완주)
  const [canComplete, setCanComplete] = useState(() =>
    isSessionComplete(session),
  )
  const saver = useStudyResultSaver(quizSetId, session.sessionId, {
    onSaved: (progress, pendingEmpty) => {
      // 보낼 결과가 남아 있으면 중간 응답이므로 판단하지 않는다
      if (!pendingEmpty) return
      if (progress.completable) {
        setCanComplete(true)
        return
      }
      // 메모리상 다 풀었고 보낼 결과도 없는데 서버가 완주 불가라면 서로 어긋난 것. 서버 상태로 다시 맞춘다
      const answeredAll =
        Object.keys(resultsRef.current).length >= quizzes.length
      if (answeredAll) onResync()
    },
    onResync,
    onSignupRequired,
  })
  const completion = useStudyCompletion(quizSetId, session.sessionId, {
    enabled: canComplete,
    onResync,
    onSignupRequired,
  })
  const [state, setState] = useState<QuizState>(() =>
    createQuizState(quizzes[session.nextQuizIndex]),
  )
  // 이전 문제를 보는 중이면 그 문제의 번호. 지금 푸는 문제를 보고 있으면 null.
  // 이전 문제를 보는 동안에도 지금 문제의 입력 상태(state)는 그대로 남는다
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)
  const viewIndex = reviewIndex ?? index
  const reviewQuiz =
    reviewIndex === null
      ? undefined
      : (quizzes[reviewIndex] as QuizSnapshot | undefined)

  const quiz = quizzes[index] as QuizSnapshot | undefined
  const answers = quiz?.answers ?? []
  const solved = answers.map((answer, i) =>
    isAnswerCorrect(state.inputs[i] ?? '', answer),
  )
  const allSolved = answers.length > 0 && solved.every(Boolean)
  // 다 맞혔거나 포기했으면 이 문제는 끝. 다음으로 넘어갈 수 있다
  const isQuizDone = allSolved || state.gaveUp

  // 채점 결과를 메모리에 반영하고 서버에 저장한다
  const record = (target: QuizSnapshot, result: StudyResult) => {
    const next = { ...resultsRef.current, [String(target.quizId)]: result }
    resultsRef.current = next
    setResults(next)
    saver.save({ quizId: target.quizId, result })
  }

  const setInput = (blankIndex: number, value: string) => {
    if (!quiz || isQuizDone || solved[blankIndex]) return
    const inputs = state.inputs.map((v, i) => (i === blankIndex ? value : v))
    setState({
      ...state,
      inputs,
      wrong: state.wrong.map((v, i) => (i === blankIndex ? false : v)),
    })
    // 이 입력으로 모든 빈칸을 맞혔으면 정답 처리
    if (
      answers.every((answer, i) => isAnswerCorrect(inputs[i] ?? '', answer))
    ) {
      record(quiz, 'CORRECT')
    }
  }

  // Enter로 제출했는데 틀렸으면 틀렸다고 표시한다
  const submitInput = (blankIndex: number) => {
    if (isQuizDone || solved[blankIndex]) return
    if (state.inputs[blankIndex]?.trim() === '') return
    setState((prev) => ({
      ...prev,
      wrong: prev.wrong.map((v, i) => (i === blankIndex ? true : v)),
    }))
  }

  const goTo = (nextIndex: number) => {
    setIndex(nextIndex)
    setState(createQuizState(quizzes[nextIndex]))
    setReviewIndex(null)
  }

  return {
    total: quizzes.length,
    quizzes,
    index, // 0부터
    quiz,
    isFinished: index >= quizzes.length,
    viewIndex, // 화면에 보이는 문제 번호. 이전 문제를 보는 중이면 index보다 작다
    // 이전 문제를 보는 중이면 그 문제와 결과. 결과가 없으면 null
    review: reviewQuiz
      ? {
          quiz: reviewQuiz,
          result: results[String(reviewQuiz.quizId)] ?? null,
        }
      : null,
    canGoPrev: viewIndex > 0,
    prev: () => {
      if (viewIndex > 0) setReviewIndex(viewIndex - 1)
    },
    // 이전 문제를 보는 중에 한 문제 앞으로. 지금 푸는 문제에 닿으면 풀이 화면으로 돌아간다
    nextReview: () => {
      if (reviewIndex === null) return
      setReviewIndex(reviewIndex + 1 >= index ? null : reviewIndex + 1)
    },
    inputs: state.inputs,
    wrong: state.wrong,
    solved,
    gaveUp: state.gaveUp,
    showHint: state.showHint,
    isQuizDone,
    allSolved,
    results,
    // 결과 화면용. 완주 결과(서버 계산값)와 저장·완주 요청 상태
    history: completion.history,
    isSaveFailed: saver.isFailed,
    retrySave: saver.retry,
    isCompleting: completion.isPending,
    isCompleteFailed: completion.isFailed,
    retryComplete: completion.retry,
    // 이 빈칸 입력이 정답인지 (입력 직후 다음 칸으로 포커스를 옮길 때 쓴다)
    isCorrectInput: (blankIndex: number, value: string) =>
      isAnswerCorrect(value, answers[blankIndex] ?? ''),
    setInput,
    submitInput,
    toggleHint: () =>
      setState((prev) => ({ ...prev, showHint: !prev.showHint })),
    giveUp: () => {
      if (!quiz || isQuizDone) return
      setState((prev) => ({ ...prev, gaveUp: true }))
      record(quiz, 'GAVE_UP')
    },
    // 다음 문제로. 결과는 정답·포기 순간에 이미 기록했다
    next: () => {
      if (isQuizDone) goTo(index + 1)
    },
  }
}
