import { useState } from 'react'
import { isAnswerCorrect, type QuizResult } from '../domain/study'
import type { QuizResponse } from '../types/quiz'

// 지금 풀고 있는 문제 하나의 상태
type QuizState = {
  inputs: string[] // 빈칸별 입력값
  wrong: boolean[] // 빈칸별로 틀린 답을 제출(Enter)했는지
  gaveUp: boolean
  showHint: boolean
}

const createQuizState = (quiz: QuizResponse | undefined): QuizState => ({
  inputs: quiz?.answers.map(() => '') ?? [],
  wrong: quiz?.answers.map(() => false) ?? [],
  gaveUp: false,
  showHint: false,
})

// 퀴즈 풀이 세션. 채점은 클라이언트에서 실시간으로 한다.
// 틀려도 무제한 다시 입력할 수 있고, 포기해야만 오답으로 기록한다
export function useStudySession(quizzes: QuizResponse[]) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<QuizResult[]>([])
  const [state, setState] = useState<QuizState>(() =>
    createQuizState(quizzes[0]),
  )

  const quiz = quizzes[index] as QuizResponse | undefined
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
  }

  return {
    total: quizzes.length,
    index, // 0부터
    quiz,
    isFinished: index >= quizzes.length,
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
    next: () => {
      if (!isQuizDone) return
      setResults((prev) => [...prev, state.gaveUp ? 'wrong' : 'correct'])
      goTo(index + 1)
    },
    restart: () => {
      setResults([])
      goTo(0)
    },
  }
}
