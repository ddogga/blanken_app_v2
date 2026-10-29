import { Outlet } from 'react-router'
import SideNav from './SideNav'
import TopBar from './TopBar'

// 로그인 후 화면 공통 틀: 상단바 + 사이드바 + 본문(Outlet 자리에 각 페이지가 들어간다)
function AppLayout() {
  return (
    <div className="min-h-dvh bg-black text-white">
      <TopBar />
      <div className="md:flex">
        <SideNav />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
