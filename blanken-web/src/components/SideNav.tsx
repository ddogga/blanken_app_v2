import { NavLink } from 'react-router'

const NAV_ITEMS = [
  { to: '/', label: '내 퀴즈셋' },
  { to: '/history', label: '학습 히스토리' },
  { to: '/social', label: '소셜' },
]

// 모바일: 상단 가로 탭 / md 이상: 왼쪽 세로 사이드바
function SideNav() {
  return (
    <nav className="border-b border-neutral-800 md:w-56 md:shrink-0 md:border-r md:border-b-0">
      <ul className="flex gap-1 overflow-x-auto px-4 py-2 md:flex-col md:px-3 md:py-6">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="shrink-0">
            <NavLink
              to={item.to}
              end
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-[15px] transition-colors ${
                  isActive
                    ? 'bg-neutral-900 font-semibold text-white'
                    : 'text-neutral-400 active:bg-neutral-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default SideNav
