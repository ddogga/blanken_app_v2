import EmptyQuizSets from '../components/EmptyQuizSets'
import QuizSetCard from '../components/QuizSetCard'
import { QUIZ_SET_ORDER_OPTIONS, isQuizSetOrder } from '../domain/quizSet'
import { useMyQuizSets } from '../hooks/useMyQuizSets'

function MyQuizSetsPage() {
  const { order, setOrder, quizSets, totalCount, isLoading, isError } =
    useMyQuizSets()

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
          <>
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
          </>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-16 text-center text-neutral-500">불러오는 중...</p>
        ) : isError ? (
          <p className="py-16 text-center text-neutral-500">
            퀴즈셋을 불러오지 못했어요.
          </p>
        ) : quizSets.length === 0 ? (
          <EmptyQuizSets />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {quizSets.map((quizSet) => (
              <li key={quizSet.id}>
                <QuizSetCard quizSet={quizSet} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default MyQuizSetsPage
