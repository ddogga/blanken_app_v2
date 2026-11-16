import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { parseQuizSetId } from '../domain/quizSet'
import { countCorrect, parseBlankedSentence } from '../domain/study'
import { useStartStudySession } from '../hooks/useStartStudySession'
import { useStudySession } from '../hooks/useStudySession'
import { useStudySessionQuery } from '../hooks/useStudySessionQuery'
import type { StudySessionResponse } from '../types/study'

// 학습 화면. 상단바·사이드바 없이 전체 화면으로 보여준다
function StudyPage() {
  const quizSetId = parseQuizSetId(useParams().quizSetId)
  const navigate = useNavigate()
  const location = useLocation()

  // 이전 페이지로. 주소로 바로 들어와 이전 기록이 없으면 내 퀴즈셋으로 보낸다
  const exit = () => {
    if (location.key === 'default') navigate('/', { replace: true })
    else navigate(-1)
  }

  if (quizSetId === null) {
    return (
      <StudyShell onExit={exit} progress={0} label="">
        <p className="py-16 text-center text-neutral-500">
          퀴즈셋을 찾을 수 없어요.
        </p>
      </StudyShell>
    )
  }
  return <StudySession key={quizSetId} quizSetId={quizSetId} onExit={exit} />
}

function StudySession({
  quizSetId,
  onExit,
}: {
  quizSetId: number
  onExit: () => void
}) {
  const navigate = useNavigate()
  const { session, isLoading, failure } = useStudySessionQuery(quizSetId)
  // 결과 화면의 '다시 학습하기'. 새 세션이 캐시에 들어가면 아래 key가 바뀌어 처음부터 그린다
  const restart = useStartStudySession(quizSetId, {
    onNotFound: onExit,
    onSignupRequired: () => navigate('/signup', { replace: true }),
  })

  if (failure?.type === 'signupRequired') {
    return <Navigate to="/signup" replace />
  }
  if (failure?.type === 'notFound' || failure?.type === 'alert') {
    return (
      <StudyShell onExit={onExit} progress={0} label="">
        <p className="py-16 text-center text-neutral-500">{failure.message}</p>
      </StudyShell>
    )
  }
  // 401은 인터셉터가 토큰을 지우면 로그인 가드가 /login으로 보낸다. 그때까지 로딩으로 둔다
  if (isLoading || !session) {
    return (
      <StudyShell onExit={onExit} progress={0} label="">
        <p className="py-16 text-center text-neutral-500">불러오는 중...</p>
      </StudyShell>
    )
  }
  return (
    <StudyPlay
      key={session.sessionId}
      studySession={session}
      onExit={onExit}
      onRestart={restart.restart}
      isRestarting={restart.isPending}
    />
  )
}

function StudyPlay({
  studySession,
  onExit,
  onRestart,
  isRestarting,
}: {
  studySession: StudySessionResponse
  onExit: () => void
  onRestart: () => void
  isRestarting: boolean
}) {
  const session = useStudySession(studySession)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  if (session.total === 0) {
    return (
      <StudyShell onExit={onExit} progress={0} label="0 / 0">
        <p className="py-16 text-center text-neutral-500">
          학습할 퀴즈가 없어요.
        </p>
      </StudyShell>
    )
  }

  if (session.isFinished || !session.quiz) {
    const correct = countCorrect(session.results)
    return (
      <StudyShell
        onExit={onExit}
        progress={1}
        label={`${session.total} / ${session.total}`}
      >
        <div className="flex flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-12 text-center">
          <p className="text-2xl font-bold">학습 완료!</p>
          <p className="mt-3 text-neutral-400">
            {session.total}문제 중{' '}
            <span className="font-semibold text-white">{correct}문제</span>를
            맞혔어요
          </p>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
            <button
              type="button"
              onClick={onRestart}
              disabled={isRestarting}
              className="h-12 rounded-xl bg-white font-semibold text-black transition-opacity active:opacity-80 disabled:opacity-50"
            >
              {isRestarting ? '준비 중...' : '다시 학습하기'}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="h-12 rounded-xl border border-neutral-700 font-semibold text-white transition-colors active:bg-neutral-900"
            >
              나가기
            </button>
          </div>
        </div>
      </StudyShell>
    )
  }

  if (session.review) {
    const { quiz: reviewQuiz, result } = session.review
    const tone = result ? REVIEW_TONE[result] : null
    return (
      <StudyShell
        onExit={onExit}
        progress={session.index / session.total}
        label={`${session.viewIndex + 1} / ${session.total}`}
        footer={
          <>
            <p className={`text-sm ${tone?.text ?? 'text-neutral-500'}`}>
              {tone?.label ?? '이전 문제'}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={session.prev}
                disabled={!session.canGoPrev}
                className="h-12 rounded-xl border border-neutral-700 px-4 font-semibold text-white transition-colors active:bg-neutral-900 disabled:border-neutral-800 disabled:text-neutral-600"
              >
                이전
              </button>
              <button
                type="button"
                onClick={session.nextReview}
                className="h-12 rounded-xl bg-white px-8 font-semibold text-black transition-opacity active:opacity-80"
              >
                다음
              </button>
            </div>
          </>
        }
      >
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-8 md:px-8">
          <p className="text-xl leading-[3rem] md:text-2xl md:leading-[3.5rem]">
            {parseBlankedSentence(reviewQuiz.sentence).map(
              (part, partIndex) => {
                if (part.type === 'text') {
                  return <span key={partIndex}>{part.text}</span>
                }
                const answer = reviewQuiz.answers[part.index] ?? ''
                return (
                  <input
                    key={partIndex}
                    type="text"
                    value={answer}
                    disabled
                    aria-label={`${part.index + 1}번째 빈칸`}
                    // 정답 길이에 맞춘 칸 너비. 값마다 달라서 클래스로 표현할 수 없다
                    style={{ width: `${Math.max(answer.length, 3) + 2}ch` }}
                    className={`mx-1 border-b-2 bg-transparent px-1 text-center font-semibold ${
                      tone?.blank ?? 'border-neutral-500 text-white'
                    }`}
                  />
                )
              },
            )}
          </p>
          {reviewQuiz.translation && (
            <p className="mt-6 text-neutral-400">{reviewQuiz.translation}</p>
          )}
        </div>
      </StudyShell>
    )
  }

  const { quiz } = session
  const parts = parseBlankedSentence(quiz.sentence)
  const hasWrong = session.wrong.some((wrong, i) => wrong && !session.solved[i])

  const handleChange = (blankIndex: number, value: string) => {
    session.setInput(blankIndex, value)
    if (!session.isCorrectInput(blankIndex, value)) return
    // 맞힌 칸은 잠기므로, 아직 못 맞힌 다음 칸으로 포커스를 옮긴다
    const nextBlank = session.solved.findIndex(
      (solved, i) => !solved && i !== blankIndex,
    )
    if (nextBlank >= 0) inputRefs.current[nextBlank]?.focus()
  }

  return (
    <StudyShell
      onExit={onExit}
      progress={session.index / session.total}
      label={`${session.index + 1} / ${session.total}`}
      footer={
        <>
          <p
            className={`text-sm ${
              session.allSolved
                ? 'text-emerald-400'
                : session.gaveUp
                  ? 'text-amber-400'
                  : hasWrong
                    ? 'text-red-400'
                    : 'text-neutral-500'
            }`}
          >
            {session.allSolved
              ? '정답이에요!'
              : session.gaveUp
                ? '정답을 확인하고 넘어가세요'
                : hasWrong
                  ? '틀렸어요. 다시 입력해 보세요'
                  : '빈칸에 들어갈 단어를 입력하세요'}
          </p>
          {session.isQuizDone ? (
            <div className="flex shrink-0 gap-2">
              {session.canGoPrev && (
                <button
                  type="button"
                  onClick={session.prev}
                  className="h-12 rounded-xl border border-neutral-700 px-4 font-semibold text-white transition-colors active:bg-neutral-900"
                >
                  이전
                </button>
              )}
              <button
                type="button"
                onClick={session.next}
                // 끝나면 바로 Enter로 넘어갈 수 있게 포커스를 준다
                autoFocus
                className="h-12 rounded-xl bg-white px-8 font-semibold text-black transition-opacity active:opacity-80"
              >
                {session.index + 1 === session.total ? '결과 보기' : '다음'}
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 gap-2">
              {session.canGoPrev && (
                <button
                  type="button"
                  onClick={session.prev}
                  className="h-12 rounded-xl border border-neutral-700 px-4 font-semibold text-white transition-colors active:bg-neutral-900"
                >
                  이전
                </button>
              )}
              <button
                type="button"
                onClick={session.toggleHint}
                disabled={!quiz.hint}
                aria-pressed={session.showHint}
                className={`h-12 rounded-xl border px-4 font-semibold transition-colors disabled:border-neutral-800 disabled:text-neutral-600 ${
                  session.showHint
                    ? 'border-white bg-neutral-800 text-white'
                    : 'border-neutral-700 text-white active:bg-neutral-900'
                }`}
              >
                힌트
              </button>
              <button
                type="button"
                onClick={session.giveUp}
                className="h-12 rounded-xl border border-neutral-700 px-4 font-semibold text-neutral-300 transition-colors active:bg-neutral-900"
              >
                포기하기
              </button>
            </div>
          )}
        </>
      }
    >
      {/* 문제가 바뀌면 다시 그려서 첫 빈칸에 포커스를 준다 */}
      <div
        key={session.index}
        className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-8 md:px-8"
      >
        <p className="text-xl leading-[3rem] md:text-2xl md:leading-[3.5rem]">
          {parts.map((part, partIndex) => {
            if (part.type === 'text') {
              return <span key={partIndex}>{part.text}</span>
            }
            const i = part.index
            const answer = quiz.answers[i] ?? ''
            const solved = session.solved[i]
            const revealed = session.gaveUp && !solved
            const wrong = session.wrong[i] && !solved
            return (
              <input
                key={partIndex}
                ref={(el) => {
                  inputRefs.current[i] = el
                }}
                type="text"
                value={revealed ? answer : (session.inputs[i] ?? '')}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') session.submitInput(i)
                }}
                disabled={solved || session.gaveUp}
                autoFocus={i === 0}
                aria-label={`${i + 1}번째 빈칸`}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                // 정답 길이에 맞춘 칸 너비. 값마다 달라서 클래스로 표현할 수 없다
                style={{ width: `${Math.max(answer.length, 3) + 2}ch` }}
                className={`mx-1 border-b-2 bg-transparent px-1 text-center font-semibold outline-none transition-colors ${
                  solved
                    ? 'border-emerald-400 text-emerald-400'
                    : revealed
                      ? 'border-amber-400 text-amber-400'
                      : wrong
                        ? 'border-red-400 text-red-400'
                        : 'border-neutral-500 text-white focus:border-white'
                }`}
              />
            )
          })}
        </p>

        {quiz.translation && (
          <p className="mt-6 text-neutral-400">{quiz.translation}</p>
        )}

        {session.showHint && quiz.hint && (
          <p className="mt-4 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
            <span className="mr-2 text-neutral-500">힌트</span>
            {quiz.hint}
          </p>
        )}
      </div>
    </StudyShell>
  )
}

// 이전 문제 보기: 맞힌 문제는 초록, 포기한 문제는 빨강
const REVIEW_TONE = {
  CORRECT: {
    label: '맞힌 문제예요',
    text: 'text-emerald-400',
    blank: 'border-emerald-400 text-emerald-400',
  },
  GAVE_UP: {
    label: '포기한 문제예요',
    text: 'text-red-400',
    blank: 'border-red-400 text-red-400',
  },
} as const

type ShellProps = {
  onExit: () => void
  progress: number // 0~1
  label: string
  children: ReactNode
  footer?: ReactNode
}

// 학습 화면 공통 틀: 상단 진행 바 + 닫기, 하단 버튼 영역
function StudyShell({ onExit, progress, label, children, footer }: ShellProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-black text-white">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-4">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800"
        >
          <div
            // 진행률은 계속 바뀌는 값이라 클래스로 표현할 수 없다
            style={{ width: `${progress * 100}%` }}
            className="h-full rounded-full bg-white transition-[width] duration-300"
          />
        </div>
        <span className="shrink-0 text-sm text-neutral-400 tabular-nums">
          {label}
        </span>
        <button
          type="button"
          onClick={onExit}
          aria-label="학습 닫기"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors active:bg-neutral-800"
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-32">
        {children}
      </div>

      {footer && (
        <footer className="fixed inset-x-0 bottom-0 border-t border-neutral-900 bg-black/95 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
            {footer}
          </div>
        </footer>
      )}
    </main>
  )
}

export default StudyPage
