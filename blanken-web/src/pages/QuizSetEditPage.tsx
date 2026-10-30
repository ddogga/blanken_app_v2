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
import { getDraftErrors, isDraftBlank, isDraftValid } from '../domain/quizDraft'
import {
  isQuizSetEdited,
  toEditState,
  toUpdateQuizSetRequest,
} from '../domain/quizSetEdit'
import {
  QUIZ_SET_DESCRIPTION_MAX_LENGTH,
  QUIZ_SET_TITLE_MAX_LENGTH,
} from '../domain/quizSetForm'
import { useCategories } from '../hooks/useCategories'
import { useQuizDrafts } from '../hooks/useQuizDrafts'
import { useQuizSetDetail } from '../hooks/useQuizSetDetail'
import { useQuizSetForm } from '../hooks/useQuizSetForm'
import { useUpdateQuizSet } from '../hooks/useUpdateQuizSet'
import { showConfirm } from '../platform/dialog'
import type { QuizSetDetailResponse } from '../types/quizSet'

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
  const { detail, dataUpdatedAt } = useQuizSetDetail(quizSetId)
  const update = useUpdateQuizSet(quizSetId)
  // 저장에 성공하면 응답으로 캐시가 바뀌고, key가 바뀌어 편집 상태를 응답으로 새로 만든다
  return <QuizSetEditForm key={dataUpdatedAt} detail={detail} update={update} />
}

type FormProps = {
  detail: QuizSetDetailResponse
  update: ReturnType<typeof useUpdateQuizSet>
}

function QuizSetEditForm({ detail, update }: FormProps) {
  const quizSet = detail
  const initial = toEditState(detail)
  const form = useQuizSetForm(initial.values)
  const quiz = useQuizDrafts(initial.drafts)
  const category = useCategories()

  const edited = isQuizSetEdited(initial, {
    values: form.values,
    drafts: quiz.drafts,
  })
  const request = toUpdateQuizSetRequest(form.values, quiz.drafts)
  const serverErrors = update.getInputErrors(request)
  const canSave = edited && request !== null && !update.isPending
  const invalidQuizNumbers = quiz.drafts
    .map((draft, index) => (isDraftValid(draft) ? null : index + 1))
    .filter((number) => number !== null)

  const titleError = form.titleError ?? serverErrors?.fieldErrors.title
  const descriptionError =
    form.descriptionError ?? serverErrors?.fieldErrors.description
  const categoryError = serverErrors?.fieldErrors.categoryId

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
        <div className="flex items-center gap-3">
          <SaveStatus
            edited={edited}
            saved={update.isSuccess}
            invalidQuizNumbers={invalidQuizNumbers}
            invalidForm={request === null}
          />
          <button
            type="button"
            onClick={() => {
              if (request) update.save(request)
            }}
            disabled={!canSave}
            className="h-10 shrink-0 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-opacity active:opacity-80 disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            {update.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {serverErrors && serverErrors.formErrors.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverErrors.formErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

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
          className={`h-10 rounded-full border bg-neutral-900 px-4 text-base text-white outline-none focus:border-neutral-500 md:text-sm ${
            categoryError ? 'border-red-400' : 'border-neutral-800'
          }`}
        >
          {categoryOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {categoryError && (
        <p className="mt-2 text-xs text-red-400">{categoryError}</p>
      )}

      <div
        className={`mt-4 rounded-xl border bg-neutral-900 px-4 pt-2 pb-3 focus-within:border-white ${
          titleError ? 'border-red-400' : 'border-neutral-800'
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
      {titleError && <p className="mt-2 text-xs text-red-400">{titleError}</p>}

      <div
        className={`mt-2 rounded-xl border bg-neutral-900 px-4 pt-2 pb-3 focus-within:border-white ${
          descriptionError ? 'border-red-400' : 'border-neutral-800'
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
      {descriptionError && (
        <p className="mt-2 text-xs text-red-400">{descriptionError}</p>
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
                  errors={{
                    // 아무것도 입력하지 않은 새 퀴즈에는 안내를 띄우지 않는다
                    ...(isDraftBlank(draft) ? {} : getDraftErrors(draft)),
                    ...serverErrors?.quizErrors[index],
                  }}
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

type SaveStatusProps = {
  edited: boolean
  saved: boolean
  invalidQuizNumbers: number[]
  invalidForm: boolean
}

// 저장 버튼 옆 안내: 저장됨 / 확인이 필요한 퀴즈
function SaveStatus({
  edited,
  saved,
  invalidQuizNumbers,
  invalidForm,
}: SaveStatusProps) {
  if (!edited) {
    return saved ? (
      <span className="text-sm text-neutral-400">저장했어요</span>
    ) : null
  }
  if (!invalidForm) return null
  return (
    <span className="text-right text-sm text-amber-400">
      {invalidQuizNumbers.length > 0
        ? `${invalidQuizNumbers.join(', ')}번 퀴즈를 확인해 주세요`
        : '입력을 확인해 주세요'}
    </span>
  )
}

export default QuizSetEditPage
