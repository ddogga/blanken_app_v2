import { Link } from 'react-router'

function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-black">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:px-6">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          blankEN
        </Link>

        {/* 모바일: 둘째 줄 전체 폭 / md 이상: 가운데 */}
        <div className="order-last w-full md:order-none md:mx-auto md:w-full md:max-w-md">
          <label htmlFor="global-search" className="sr-only">
            퀴즈셋 검색
          </label>
          <div className="flex h-10 items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 focus-within:border-neutral-500">
            <svg
              viewBox="0 0 24 24"
              className="size-4 shrink-0 text-neutral-500"
              aria-hidden="true"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
              />
            </svg>
            <input
              id="global-search"
              type="search"
              placeholder="퀴즈셋 이름으로 검색"
              className="h-full w-full bg-transparent text-base outline-none placeholder:text-neutral-600 md:text-sm"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            aria-label="알림"
            className="flex size-10 items-center justify-center rounded-xl text-neutral-300 transition-colors active:bg-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"
              />
            </svg>
          </button>
          <button
            type="button"
            className="h-10 rounded-xl px-3 text-sm text-neutral-300 transition-colors active:bg-neutral-800"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopBar
