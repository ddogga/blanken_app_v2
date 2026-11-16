import { useEffect, useRef } from 'react'

type Props = {
  solvedCount: number
  total: number
  isRestarting: boolean
  onResume: () => void
  onRestart: () => void
  onClose: () => void
}

// 진행 중인 학습 세션을 이어서 풀지 묻는다. 열릴 때 마운트, 닫힐 때 언마운트된다
function StudyResumeDialog({
  solvedCount,
  total,
  isRestarting,
  onResume,
  onRestart,
  onClose: requestClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // 처음부터 시작 요청 중에는 닫지 않는다 (응답이 오면 학습 화면으로 이동하므로)
  const onClose = () => {
    if (!isRestarting) requestClose()
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="study-resume-title"
      // Esc: 브라우저가 직접 닫지 않게 막고, 닫기는 부모 상태로 처리한다
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      // 바깥(배경) 클릭 시 닫기
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-0 text-white backdrop:bg-black/70"
    >
      <div className="px-6 py-8 text-center">
        <p id="study-resume-title" className="text-lg font-bold">
          {solvedCount}/{total}문제까지 풀었어요
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          이어서 풀까요, 처음부터 다시 풀까요?
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            disabled={isRestarting}
            autoFocus
            className="h-12 rounded-xl bg-white font-semibold text-black transition-opacity active:opacity-80 disabled:opacity-50"
          >
            이어서 풀기
          </button>
          <button
            type="button"
            onClick={onRestart}
            disabled={isRestarting}
            className="h-12 rounded-xl border border-neutral-700 font-semibold text-white transition-colors active:bg-neutral-900 disabled:text-neutral-500"
          >
            {isRestarting ? '준비 중...' : '처음부터'}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default StudyResumeDialog
