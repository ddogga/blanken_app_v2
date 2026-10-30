import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ComponentProps } from 'react'
import QuizEditCard from './QuizEditCard'

type Props = Omit<ComponentProps<typeof QuizEditCard>, 'dragHandle'>

function SortableQuizItem(props: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.draft.key })

  return (
    <li
      ref={setNodeRef}
      // 드래그 중 위치는 매 프레임 바뀌는 값이라 Tailwind 클래스로 표현할 수 없다
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? 'relative z-10 opacity-90 shadow-2xl' : ''}
    >
      <QuizEditCard
        {...props}
        dragHandle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`${props.number}번 퀴즈 순서 바꾸기`}
            // touch-none: 모바일에서 손잡이를 끌 때 화면이 스크롤되지 않게 한다
            className={`flex size-9 touch-none items-center justify-center rounded-full text-neutral-400 transition-colors active:bg-neutral-800 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              {[6, 12, 18].flatMap((x) =>
                [9, 15].map((y) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="1.8"
                    fill="currentColor"
                  />
                )),
              )}
            </svg>
          </button>
        }
      />
    </li>
  )
}

export default SortableQuizItem
