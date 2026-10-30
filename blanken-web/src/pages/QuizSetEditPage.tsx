import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Link, useParams } from 'react-router'
import CircleCheckbox from '../components/CircleCheckbox'
import SortableQuizItem from '../components/SortableQuizItem'
import TrashIcon from '../components/TrashIcon'
import { parseQuizSetId } from '../domain/quizSet'
import {
  QUIZ_SET_DESCRIPTION_MAX_LENGTH,
  QUIZ_SET_TITLE_MAX_LENGTH,
  fromQuizSetResponse,
} from '../domain/quizSetForm'
import { useCategories } from '../hooks/useCategories'
import { useQuizDrafts } from '../hooks/useQuizDrafts'
import { useQuizSetDetail } from '../hooks/useQuizSetDetail'
import { useQuizSetForm } from '../hooks/useQuizSetForm'
import { showConfirm } from '../platform/dialog'
import type { QuizResponse } from '../types/quiz'
import type { QuizSetResponse } from '../types/quizSet'

function QuizSetEditPage() {
  const quizSetId = parseQuizSetId(useParams().quizSetId)

  if (quizSetId === null) {
    return (
      <section className="mx-auto max-w-5xl py-16 text-center text-neutral-500">
        <p>퀴즈셋을 찾을 수 없어요.</p>
        <Link to="/" className="mt-4 inline-block text-white underline">
          내 퀴즈셋으로
        </Link>
      </section>
    )
  }
  // 다른 퀴즈셋으로 이동하면 key가 바뀌어 편집 상태를 새로 만든다
  return <QuizSetEditor key={quizSetId} quizSetId={quizSetId} />
}

function QuizSetEditor({ quizSetId }: { quizSetId: number }) {
  const { quizSet, quizzes } = useQuizSetDetail(quizSetId)
  return <QuizSetEditForm quizSet={quizSet} quizzes={quizzes} />
}

type FormProps = {
  quizSet: QuizSetResponse
  quizzes: QuizResponse[]
}

function QuizSetEditForm({ quizSet, quizzes }: FormProps) {
  const form = useQuizSetForm(fromQuizSetResponse(quizSet))
  const quiz = useQuizDrafts(quizzes)
  const category = useCategories()

  // 목록을 받기 전이거나 목록에 없어도 현재 카테고리는 보이게 한다
  const categoryOptions = category.categories.some(
    (item) => item.id === quizSet.category.id,
  )
    ? category.categories
    : [quizSet.category, ...category.categories]

  const isPrivate = form.values.visibility === 'PRIVATE'

  // 손잡이를 살짝(5px) 끌어야 드래그가 시작된다. 그냥 누르기와 구분하기 위함
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      quiz.moveQuiz(String(active.id), String(over.id))
    }
  }

  const removeSelected = async () => {
    const ok = await showConfirm(
      `선택한 퀴즈 ${quiz.selectedCount}개를 삭제할까요?`,
    )
    if (ok) quiz.removeSelected()
  }

  return (
    <section className="mx-auto max-w-5xl pb-16">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-neutral-400 active:text-white"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 6l-6 6 6 6"
          />
        </svg>
        내 퀴즈셋
      </Link>

      <div className="mt-3 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">퀴즈셋 수정</h1>
        <button
          type="button"
          disabled={!form.canSubmit}
          className="h-10 shrink-0 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-opacity active:opacity-80 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          저장
        </button>
      </div>

      {/* 퀴즈셋 정보 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={form.toggleVisibility}
          aria-label={`공개 범위: ${isPrivate ? '비공개' : '공개'}. 눌러서 바꾸기`}
          className="flex h-10 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 text-sm transition-colors active:bg-neutral-800"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d={
                isPrivate
                  ? 'M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z'
                  : 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z'
              }
            />
          </svg>
          {isPrivate ? '비공개' : '공개'}
        </button>

        <label htmlFor="quiz-set-edit-category" className="sr-only">
          카테고리
        </label>
        <select
          id="quiz-set-edit-category"
          onPointerDown={category.retryIfFailed}
          value={form.values.categoryId ?? ''}
          onChange={(e) =>
            form.setCategoryId(
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
          className="h-10 rounded-full border border-neutral-800 bg-neutral-900 px-4 text-base text-white outline-none focus:border-neutral-500 md:text-sm"
        >
          {categoryOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`mt-4 rounded-xl border bg-neutral-900 px-4 pt-2 pb-3 focus-within:border-white ${
          form.titleError ? 'border-red-400' : 'border-neutral-800'
        }`}
      >
        <div className="flex justify-between text-xs text-neutral-500">
          <label htmlFor="quiz-set-edit-title">제목</label>
          <span>
            {form.titleLength}/{QUIZ_SET_TITLE_MAX_LENGTH}
          </span>
        </div>
        <input
          id="quiz-set-edit-title"
          type="text"
          value={form.values.title}
          onChange={(e) => form.setTitle(e.target.value)}
          autoComplete="off"
          className="mt-1 w-full bg-transparent text-base outline-none"
        />
      </div>
      {form.titleError && (
        <p className="mt-2 text-xs text-red-400">{form.titleError}</p>
      )}

      <div
        className={`mt-2 rounded-xl border bg-neutral-900 px-4 pt-2 pb-3 focus-within:border-white ${
          form.descriptionError ? 'border-red-400' : 'border-neutral-800'
        }`}
      >
        <div className="flex justify-between text-xs text-neutral-500">
          <label htmlFor="quiz-set-edit-description">설명 (선택)</label>
          <span>
            {form.descriptionLength}/{QUIZ_SET_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="quiz-set-edit-description"
          value={form.values.description}
          onChange={(e) => form.setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-none bg-transparent text-base outline-none"
        />
      </div>
      {form.descriptionError && (
        <p className="mt-2 text-xs text-red-400">{form.descriptionError}</p>
      )}

      {/* 퀴즈 목록 */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">
          퀴즈
          <span className="ml-2 text-base font-normal text-neutral-500">
            {quiz.drafts.length}개
          </span>
        </h2>
        {quiz.drafts.length > 0 && (
          <div className="flex items-center gap-3">
            <CircleCheckbox
              checked={quiz.allSelected}
              onChange={quiz.toggleSelectAll}
            >
              <span className="text-sm text-neutral-300">전체 선택</span>
            </CircleCheckbox>
            <button
              type="button"
              onClick={() => void removeSelected()}
              disabled={quiz.selectedCount === 0}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-red-500/15 px-3 text-sm font-semibold text-red-400 transition-colors active:bg-red-500/25 disabled:bg-neutral-900 disabled:text-neutral-600"
            >
              <TrashIcon />
              {quiz.selectedCount > 0
                ? `${quiz.selectedCount}개 삭제`
                : '선택 삭제'}
            </button>
          </div>
        )}
      </div>

      {quiz.drafts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-neutral-700 py-12 text-center text-neutral-500">
          아직 퀴즈가 없어요. 첫 퀴즈를 추가해 보세요.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={quiz.drafts.map((draft) => draft.key)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="mt-4 space-y-4">
              {quiz.drafts.map((draft, index) => (
                <SortableQuizItem
                  key={draft.key}
                  number={index + 1}
                  draft={draft}
                  selected={quiz.selectedKeys.has(draft.key)}
                  onToggleSelect={() => quiz.toggleSelect(draft.key)}
                  onRemove={() => quiz.removeQuiz(draft.key)}
                  onChangeSentence={(sentence) =>
                    quiz.setSentence(draft.key, sentence)
                  }
                  onToggleBlank={(tokenIndex) =>
                    quiz.toggleBlank(draft.key, tokenIndex)
                  }
                  onChangeTranslation={(translation) =>
                    quiz.setTranslation(draft.key, translation)
                  }
                  onChangeHint={(hint) => quiz.setHint(draft.key, hint)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={quiz.addQuiz}
          className="h-12 w-full max-w-xs rounded-xl border border-neutral-700 font-semibold text-white transition-colors active:bg-neutral-900"
        >
          + 퀴즈 추가하기
        </button>
      </div>
    </section>
  )
}

export default QuizSetEditPage
