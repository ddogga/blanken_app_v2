import { Navigate, Outlet } from 'react-router'
import { useAuthState } from '../hooks/useAuthState'

// 로그인하지 않은 사용자만 하위 라우트(로그인 화면)를 볼 수 있다
function RequireAnonymous() {
  const authState = useAuthState()

  if (authState === 'member') return <Navigate to="/" replace />
  if (authState === 'guest') return <Navigate to="/signup" replace />
  return <Outlet />
}

export default RequireAnonymous
