import type { ReactNode } from 'react'

type Props = {
  checked: boolean
  onChange: () => void
  ariaLabel?: string
  children?: ReactNode // 옆에 보일 글자
}

// 원 모양 체크박스. 실제 input은 숨기고 모양만 그린다 (키보드·스크린리더는 input이 처리)
function CircleCheckbox({ checked, onChange, ariaLabel, children }: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/60 ${
          checked ? 'border-white bg-white text-black' : 'border-neutral-600'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5l4.5 4.5L19 7.5"
            />
          </svg>
        )}
      </span>
      {children}
    </label>
  )
}

export default CircleCheckbox
