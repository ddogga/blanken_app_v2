import type { ReactNode } from 'react'
import type { SocialProvider } from '../types/auth'

type ButtonStyle = {
  label: string
  className: string
  icon: ReactNode
}

const BUTTON_STYLES: Record<SocialProvider, ButtonStyle> = {
  kakao: {
    label: '카카오로 시작하기',
    className: 'bg-[#FEE500] text-black/85',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 3C6.48 3 2 6.48 2 10.8c0 2.78 1.86 5.22 4.66 6.6l-1.19 4.36c-.1.38.33.68.66.46l5.2-3.45c.22.02.44.03.67.03 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"
        />
      </svg>
    ),
  },
  naver: {
    label: '네이버로 시작하기',
    className: 'bg-[#03C75A] text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"
        />
      </svg>
    ),
  },
}

type Props = {
  provider: SocialProvider
  onClick?: () => void
}

function SocialLoginButton({ provider, onClick }: Props) {
  const { label, className, icon } = BUTTON_STYLES[provider]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold transition-opacity active:opacity-80 ${className}`}
    >
      <span className="absolute left-5 flex items-center">{icon}</span>
      {label}
    </button>
  )
}

export default SocialLoginButton
