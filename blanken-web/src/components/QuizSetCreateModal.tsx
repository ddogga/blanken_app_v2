import { useEffect, useRef } from 'react'
import {
  QUIZ_SET_DESCRIPTION_MAX_LENGTH,
  QUIZ_SET_TITLE_MAX_LENGTH,
} from '../domain/quizSetForm'
import { useCategories } from '../hooks/useCategories'
import { useQuizSetForm } from '../hooks/useQuizSetForm'

type Props = {
  onClose: () => void
}

// 열릴 때 마운트, 닫힐 때 언마운트된다. 그래서 다시 열면 입력값이 비어 있다
function QuizSetCreateModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressedBackdrop = useRef(false)
  const form = useQuizSetForm()
  const { categories } = useCategories()

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  const isPrivate = form.values.visibility === 'PRIVATE'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="quiz-set-create-title"
      // Esc: 브라우저가 직접 닫지 않게 막고, 닫기는 부모 상태로 처리한다
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      // 바깥(배경) 클릭 시 닫기. 입력창에서 드래그하다 배경에서 놓은 경우는 제외한다
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) onClose()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-0 text-white backdrop:bg-black/70"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          // TODO: 퀴즈셋 생성 API 연결
        }}
        className="flex flex-col p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="quiz-set-create-title" className="text-xl font-bold">
            퀴즈셋 만들기
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-9 items-center justify-center rounded-full text-neutral-400 transition-colors active:bg-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        <label
          htmlFor="quiz-set-title"
          className="mt-6 text-sm text-neutral-400"
        >
          제목
        </label>
        <input
          id="quiz-set-title"
          type="text"
          value={form.values.title}
          onChange={(e) => form.setTitle(e.target.value)}
          placeholder="퀴즈셋 제목을 입력해 주세요"
          autoComplete="off"
          autoFocus
          className={`mt-2 h-12 rounded-xl border bg-neutral-900 px-4 text-base outline-none placeholder:text-neutral-600 ${
            form.titleError
              ? 'border-red-400'
              : 'border-neutral-800 focus:border-white'
          }`}
        />
        <div className="mt-2 flex justify-between gap-4 text-xs">
          <span className="text-red-400">{form.titleError}</span>
          <span className="shrink-0 text-neutral-500">
            {form.titleLength}/{QUIZ_SET_TITLE_MAX_LENGTH}
          </span>
        </div>

        <label
          htmlFor="quiz-set-description"
          className="mt-4 text-sm text-neutral-400"
        >
          설명 <span className="text-neutral-600">(선택)</span>
        </label>
        <textarea
          id="quiz-set-description"
          value={form.values.description}
          onChange={(e) => form.setDescription(e.target.value)}
          placeholder="어떤 문장을 담은 퀴즈셋인지 적어 주세요"
          rows={4}
          className={`mt-2 resize-none rounded-xl border bg-neutral-900 px-4 py-3 text-base outline-none placeholder:text-neutral-600 ${
            form.descriptionError
              ? 'border-red-400'
              : 'border-neutral-800 focus:border-white'
          }`}
        />
        <div className="mt-2 flex justify-between gap-4 text-xs">
          <span className="text-red-400">{form.descriptionError}</span>
          <span className="shrink-0 text-neutral-500">
            {form.descriptionLength}/{QUIZ_SET_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>

        <label
          htmlFor="quiz-set-category"
          className="mt-4 text-sm text-neutral-400"
        >
          카테고리
        </label>
        <select
          id="quiz-set-category"
          value={form.values.categoryId ?? ''}
          onChange={(e) =>
            form.setCategoryId(
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
          className={`mt-2 h-12 rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-base outline-none focus:border-white ${
            form.values.categoryId === null ? 'text-neutral-600' : 'text-white'
          }`}
        >
          <option value="" disabled>
            카테고리를 선택해 주세요
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-neutral-800 px-4 py-3">
          <div>
            <p className="font-semibold">{isPrivate ? '비공개' : '공개'}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {isPrivate ? '나만 볼 수 있어요' : '다른 사용자도 볼 수 있어요'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!isPrivate}
            aria-label="공개 여부"
            onClick={form.toggleVisibility}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              isPrivate ? 'bg-neutral-700' : 'bg-white'
            }`}
          >
            <span
              className={`absolute top-1 left-1 size-5 rounded-full transition-transform ${
                isPrivate ? 'bg-neutral-400' : 'translate-x-5 bg-black'
              }`}
            />
          </button>
        </div>

        <div className="mt-8 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-neutral-700 font-semibold text-white transition-colors active:bg-neutral-900"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!form.canSubmit}
            className="h-12 flex-1 rounded-xl bg-white font-semibold text-black transition-opacity active:opacity-80 disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            만들기
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default QuizSetCreateModal
