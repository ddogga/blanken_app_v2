import { Navigate, Outlet } from 'react-router'
import { useAuthState } from '../hooks/useAuthState'

// 가입을 마친 사용자만 하위 라우트를 볼 수 있다
function RequireAuth() {
  const authState = useAuthState()

  if (authState === 'anonymous') return <Navigate to="/login" replace />
  if (authState === 'guest') return <Navigate to="/signup" replace />
  return <Outlet />
}

export default RequireAuth
