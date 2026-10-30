import CircleCheckbox from './CircleCheckbox'
import type { ReactNode } from 'react'
import TrashIcon from './TrashIcon'
import {
  getDraftAnswers,
  getDraftError,
  type QuizDraft,
} from '../domain/quizDraft'
import {
  getBlankIndexes,
  splitByBlanks,
  tokenizeSentence,
} from '../domain/quizSentence'

type Props = {
  number: number
  draft: QuizDraft
  selected: boolean
  onToggleSelect: () => void
  onRemove: () => void
  dragHandle: ReactNode // 순서를 바꾸는 손잡이. 드래그 처리는 목록 쪽에서 한다
  onChangeSentence: (sentence: string) => void
  onToggleBlank: (tokenIndex: number) => void
  onChangeTranslation: (translation: string) => void
  onChangeHint: (hint: string) => void
}

function QuizEditCard({
  number,
  draft,
  selected,
  onToggleSelect,
  onRemove,
  dragHandle,
  onChangeSentence,
  onToggleBlank,
  onChangeTranslation,
  onChangeHint,
}: Props) {
  const tokens = tokenizeSentence(draft.sentence)
  const blankIndexes = new Set(getBlankIndexes(tokens, draft.blanks))
  const hasWords = tokens.some((token) => token.isWord)
  const preview =
    draft.blanks.length > 0 ? splitByBlanks(draft.sentence, draft.blanks) : null
  const translation = draft.translation.trim()
  const hint = draft.hint.trim()
  const error = getDraftError(draft)
  const sentenceId = `quiz-${draft.key}-sentence`
  const translationId = `quiz-${draft.key}-translation`
  const answerId = `quiz-${draft.key}-answer`
  const hintId = `quiz-${draft.key}-hint`

  return (
    <article
      className={`rounded-2xl border bg-neutral-950 p-5 transition-colors ${
        selected ? 'border-neutral-500' : 'border-neutral-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">{number}</span>
        <div className="flex items-center gap-2">
          <CircleCheckbox
            checked={selected}
            onChange={onToggleSelect}
            ariaLabel={`${number}번 퀴즈 선택`}
          />
          {dragHandle}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${number}번 퀴즈 삭제`}
            className="flex size-9 items-center justify-center rounded-full text-neutral-400 transition-colors active:bg-neutral-800 active:text-red-400"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <label
        htmlFor={sentenceId}
        className="mt-4 block text-sm text-neutral-400"
      >
        문장
      </label>
      <input
        id={sentenceId}
        type="text"
        value={draft.sentence}
        onChange={(e) => onChangeSentence(e.target.value)}
        placeholder="영어 문장을 입력해 주세요"
        autoComplete="off"
        className="mt-2 h-12 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-base outline-none placeholder:text-neutral-600 focus:border-white"
      />

      {hasWords && (
        <>
          <p className="mt-4 text-sm text-neutral-400">
            빈칸으로 만들 단어를 누르세요{' '}
            <span className="text-neutral-600">(여러 개 선택 가능)</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {tokens.map((token, index) => {
              if (!token.isWord) {
                // 공백은 버튼 사이 간격으로 대신하고, 문장부호만 보여준다
                const text = token.text.trim()
                return text === '' ? null : (
                  <span key={index} className="text-neutral-500">
                    {text}
                  </span>
                )
              }
              const isBlank = blankIndexes.has(index)
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onToggleBlank(index)}
                  aria-pressed={isBlank}
                  className={`h-9 rounded-lg border px-3 text-[15px] transition-colors ${
                    isBlank
                      ? 'border-white bg-white font-semibold text-black'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-200 active:bg-neutral-800'
                  }`}
                >
                  {token.text}
                </button>
              )
            })}
          </div>
        </>
      )}

      <label
        htmlFor={translationId}
        className="mt-4 block text-sm text-neutral-400"
      >
        번역 문장
      </label>
      <input
        id={translationId}
        type="text"
        value={draft.translation}
        onChange={(e) => onChangeTranslation(e.target.value)}
        placeholder="예: 그녀는 회의를 다음 주로 미루기로 했다."
        autoComplete="off"
        className="mt-2 h-12 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-base outline-none placeholder:text-neutral-600 focus:border-white"
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={answerId} className="text-sm text-neutral-400">
            정답 <span className="text-neutral-600">(자동)</span>
          </label>
          <input
            id={answerId}
            type="text"
            value={getDraftAnswers(draft).join(', ')}
            readOnly
            tabIndex={-1}
            placeholder="단어를 선택하면 채워져요"
            className="mt-2 h-12 w-full cursor-default rounded-xl border border-neutral-800 bg-black px-4 text-base font-semibold text-white outline-none placeholder:font-normal placeholder:text-neutral-600"
          />
        </div>
        <div>
          <label htmlFor={hintId} className="text-sm text-neutral-400">
            힌트 <span className="text-neutral-600">(선택)</span>
          </label>
          <input
            id={hintId}
            type="text"
            value={draft.hint}
            onChange={(e) => onChangeHint(e.target.value)}
            placeholder="예: 미루다, 연기하다"
            autoComplete="off"
            className="mt-2 h-12 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-base outline-none placeholder:text-neutral-600 focus:border-white"
          />
        </div>
      </div>

      {error && draft.sentence.trim() !== '' && (
        <p className="mt-3 text-xs text-amber-400">{error}</p>
      )}

      {preview && (
        <div className="mt-4 rounded-xl bg-neutral-900 px-4 py-3">
          <p className="text-xs text-neutral-500">학습자에게 보이는 모습</p>
          <p className="mt-2 leading-8">
            {preview.map((part, index) =>
              part.type === 'blank' ? (
                <span
                  key={index}
                  className="mx-1 inline-block w-20 border-b-2 border-neutral-400 align-middle"
                />
              ) : (
                <span key={index}>{part.text}</span>
              ),
            )}
          </p>
          {translation !== '' && (
            <p className="mt-1 text-sm text-neutral-300">{translation}</p>
          )}
          {hint !== '' && (
            <p className="mt-1 text-sm text-neutral-500">힌트: {hint}</p>
          )}
        </div>
      )}
    </article>
  )
}

export default QuizEditCard
