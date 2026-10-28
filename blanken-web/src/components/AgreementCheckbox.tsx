type Props = {
  label: string
  checked: boolean
  onChange: () => void
  tag?: '필수' | '선택'
  emphasized?: boolean
}

function AgreementCheckbox({ label, checked, onChange, tag, emphasized }: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/60 ${
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
      <span className={emphasized ? 'font-semibold' : 'text-[15px]'}>
        {tag && <span className="mr-1 text-neutral-500">({tag})</span>}
        {label}
      </span>
    </label>
  )
}

export default AgreementCheckbox
