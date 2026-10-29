import EmptyQuizSets from '../components/EmptyQuizSets'
import QuizSetCard from '../components/QuizSetCard'
import { QUIZ_SET_ORDER_OPTIONS, isQuizSetOrder } from '../domain/quizSet'
import { useMyQuizSets } from '../hooks/useMyQuizSets'

function MyQuizSetsPage() {
  const {
    order,
    setOrder,
    quizSets,
    totalCount,
    isLoading,
    isError,
    retry,
    hasMore,
    loadMore,
    isLoadingMore,
    isLoadMoreError,
  } = useMyQuizSets()

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          내 퀴즈셋
          {totalCount > 0 && (
            <span className="ml-2 text-base font-normal text-neutral-500">
              {totalCount}개
            </span>
          )}
        </h1>

        {quizSets.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="quiz-set-order" className="sr-only">
              정렬
            </label>
            <select
              id="quiz-set-order"
              value={order}
              onChange={(e) => {
                if (isQuizSetOrder(e.target.value)) setOrder(e.target.value)
              }}
              className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm text-white outline-none focus:border-neutral-500"
            >
              {QUIZ_SET_ORDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="퀴즈셋 만들기"
              className="flex size-10 items-center justify-center rounded-xl bg-white text-black transition-opacity active:opacity-80"
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  d="M12 5v14M5 12h14"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-16 text-center text-neutral-500">불러오는 중...</p>
        ) : isError ? (
          <div className="flex flex-col items-center py-16 text-neutral-500">
            <p>퀴즈셋을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 h-10 rounded-xl border border-neutral-700 px-4 text-sm text-white transition-colors active:bg-neutral-900"
            >
              다시 시도
            </button>
          </div>
        ) : quizSets.length === 0 ? (
          <EmptyQuizSets />
        ) : (
          <>
            <ul className="grid gap-4 md:grid-cols-2">
              {quizSets.map((quizSet) => (
                <li key={quizSet.id}>
                  <QuizSetCard quizSet={quizSet} />
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="mt-8 flex flex-col items-center">
                {isLoadMoreError && (
                  <p className="mb-3 text-sm text-red-400">
                    더 불러오지 못했어요. 다시 시도해 주세요.
                  </p>
                )}
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="h-12 w-full max-w-xs rounded-xl border border-neutral-700 text-sm font-semibold text-white transition-colors active:bg-neutral-900 disabled:text-neutral-500"
                >
                  {isLoadingMore ? '불러오는 중...' : '더보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default MyQuizSetsPage
