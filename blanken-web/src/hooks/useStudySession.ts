import { useState } from 'react'
import { isAnswerCorrect } from '../domain/study'
import type {
  QuizSnapshot,
  StudyResult,
  StudySessionResponse,
} from '../types/study'

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
// 처음 마운트될 때의 세션만 쓰므로, 세션이 바뀌면 key로 다시 마운트해야 한다
export function useStudySession(session: StudySessionResponse) {
  const { quizzes } = session
  const [index, setIndex] = useState(session.nextQuizIndex)
  // 키는 quizId 문자열. 서버 응답 results와 같은 모양
  const [results, setResults] = useState<Record<string, StudyResult>>(
    session.results,
  )
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

  const setInput = (blankIndex: number, value: string) => {
    if (isQuizDone || solved[blankIndex]) return
    setState((prev) => ({
      ...prev,
      inputs: prev.inputs.map((v, i) => (i === blankIndex ? value : v)),
      wrong: prev.wrong.map((v, i) => (i === blankIndex ? false : v)),
    }))
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
    // 이 빈칸 입력이 정답인지 (입력 직후 다음 칸으로 포커스를 옮길 때 쓴다)
    isCorrectInput: (blankIndex: number, value: string) =>
      isAnswerCorrect(value, answers[blankIndex] ?? ''),
    setInput,
    submitInput,
    toggleHint: () =>
      setState((prev) => ({ ...prev, showHint: !prev.showHint })),
    giveUp: () => {
      if (!isQuizDone) setState((prev) => ({ ...prev, gaveUp: true }))
    },
    // TODO: 결과 저장 API가 생기면 여기서 이 문제의 결과를 서버 세션에 저장한다
    next: () => {
      if (!isQuizDone || !quiz) return
      const result: StudyResult = state.gaveUp ? 'GAVE_UP' : 'CORRECT'
      setResults((prev) => ({ ...prev, [String(quiz.quizId)]: result }))
      goTo(index + 1)
    },
  }
}
