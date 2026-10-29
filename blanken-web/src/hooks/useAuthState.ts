import { getAuthState, type AuthState } from '../domain/auth'
import { useAuthStore } from '../stores/authStore'

// 토큰이 바뀌면(발급·교체·삭제) 이 값을 쓰는 화면이 다시 그려진다
export function useAuthState(): AuthState {
  const accessToken = useAuthStore((state) => state.accessToken)
  return getAuthState(accessToken)
}
