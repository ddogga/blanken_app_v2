import { formatDate } from '../domain/format'
import type { QuizSetResponse } from '../types/quizSet'

type Props = {
  quizSet: QuizSetResponse
}

function QuizSetCard({ quizSet }: Props) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-md bg-neutral-800 px-2 py-1 text-neutral-300">
          {quizSet.category.name}
        </span>
        {quizSet.visibility === 'PRIVATE' && (
          <span className="flex items-center gap-1 text-neutral-500">
            <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z"
              />
            </svg>
            비공개
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg leading-snug font-semibold">
        {quizSet.title}
      </h3>
      {quizSet.description && (
        <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
          {quizSet.description}
        </p>
      )}

      <div className="mt-auto flex items-center gap-3 pt-5 text-sm text-neutral-500">
        <span>문제 {quizSet.quizCount}개</span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"
            />
          </svg>
          <span className="sr-only">좋아요</span>
          {quizSet.likeCount}
        </span>
        <span className="ml-auto">{formatDate(quizSet.createdAt)}</span>
      </div>
    </article>
  )
}

export default QuizSetCard
