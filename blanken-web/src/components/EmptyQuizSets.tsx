type Props = {
  onCreate?: () => void
}

function EmptyQuizSets({ onCreate }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-700 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-neutral-900 text-neutral-300">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M12 5v14M5 12h14"
          />
        </svg>
      </div>
      <p className="mt-5 text-lg font-semibold">아직 만든 퀴즈셋이 없어요</p>
      <p className="mt-1 text-sm text-neutral-400">
        외우고 싶은 영어 문장으로 첫 퀴즈셋을 만들어 보세요
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-8 h-12 w-full max-w-xs rounded-xl bg-white font-semibold text-black transition-opacity active:opacity-80"
      >
        퀴즈셋 만들기
      </button>
    </div>
  )
}

export default EmptyQuizSets
